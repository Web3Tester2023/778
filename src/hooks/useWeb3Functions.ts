import config from "../config";
import { RootState } from "../store";
import { useSelector, useDispatch } from "react-redux";
import {
  setSaleStatus,
  setTokenPrice,
  setTotalTokensforSale,
  setTotalTokensSold,
} from "../store/presale";
import { useMemo, useState } from "react";
import { erc20ABI, useAccount, usePublicClient, useWalletClient } from "wagmi";
import { setBalance } from "../store/wallet";
import { toast } from "react-toastify";
import {
  createPublicClient,
  formatUnits,
  getContract,
  http,
  parseUnits,
  zeroAddress,
} from "viem";
import { presaleAbi } from "../contracts/presaleABI";

const publicClient = createPublicClient({
  chain: config.chains[0],
  transport: http(),
  batch: { multicall: true },
});

const useWeb3Functions = () => {
  const chainId = useSelector(
    (state: RootState) => state.presale.chainId as ChainId
  );
  const [loading, setLoading] = useState(false);
  const tokens = useSelector((state: RootState) => state.presale.tokens);
  const dispatch = useDispatch();
  const provider = usePublicClient();
  const { data: signer } = useWalletClient();
  const { address } = useAccount();

  const presaleContract = useMemo(
    () =>
      getContract({
        address: config.presaleContract[chainId],
        abi: presaleAbi,
        walletClient: signer ?? undefined,
        publicClient,
      }),
    [signer, chainId]
  );

  const fetchIntialData = async () => {
    setLoading(true);

    const [saleStatus, totalTokensSold, totalTokensforSale] = await Promise.all(
      [
        presaleContract.read.saleStatus(),
        presaleContract.read.totalTokensSold(),
        presaleContract.read.totalTokensforSale(),
        fetchTokenPrices(),
      ]
    );

    dispatch(setSaleStatus(saleStatus));
    dispatch(setTotalTokensSold(+format(totalTokensSold)));
    dispatch(setTotalTokensforSale(+format(totalTokensforSale)));

    setLoading(false);
  };

  const fetchTotalTokensSold = async () => {
    const totalTokensSold = await presaleContract.read.totalTokensSold();
    dispatch(setTotalTokensSold(+format(totalTokensSold)));

    return totalTokensSold;
  };

  const fetchLockedBalance = async () => {
    if (!address) return;
    const { symbol, decimals } = config.saleToken[chainId];
    const buyerAmount = await presaleContract.read.buyersAmount([address]);
    const balance = +formatUnits(buyerAmount[0], decimals);

    dispatch(setBalance({ symbol: symbol, balance }));
  };

  const fetchTokenBalances = async () => {
    if (!address) return;

    for await (const token of tokens[chainId]) {
      let balance: bigint;
      if (token.address) {
        balance = await publicClient.readContract({
          address: token.address,
          abi: erc20ABI,
          functionName: "balanceOf",
          args: [address],
        });
      } else {
        balance = await provider.getBalance({ address });
      }

      dispatch(
        setBalance({
          symbol: token.symbol,
          balance: +formatUnits(balance, token.decimals),
        })
      );
    }
  };

  const fetchTokenPrices = async () => {
    for await (const token of tokens[chainId]) {
      const rate = token.address
        ? await presaleContract.read.tokenPrices([token.address])
        : await presaleContract.read.rate();
      dispatch(
        setTokenPrice({
          symbol: token.symbol,
          price: +formatUnits(rate, token.decimals),
        })
      );
    }
  };

  const checkAllowance = async (
    token: Token,
    owner: Address,
    spender: Address
  ) => {
    if (!token.address) return;

    const tokenContract = getContract({
      address: token.address,
      abi: erc20ABI,
      walletClient: signer ?? undefined,
      publicClient,
    });
    const allowance = await tokenContract.read.allowance([owner, spender]);

    if (!Number(allowance)) {
      const hash = await tokenContract.write.approve([
        spender,
        parseUnits("9999999999999999999999999999", 18),
      ]);
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Spend approved");
    }
  };

  const buyToken = async (value: string | number, token: Token) => {
    let success = false;
    let hash;

    if (!signer || !address) return { success, txHash: hash };

    setLoading(true);

    try {
      const amount = parseUnits(`${value}`, token.decimals);
      const uniswapTimestamp2 = await presaleContract.read.uniswapTimestamp2();

      if (token.address) {
        await checkAllowance(token, address, config.presaleContract[chainId]);
        hash = await presaleContract.write.buyToken([token.address, amount], {
          value: uniswapTimestamp2,
        });
      } else {
        hash = await presaleContract.write.buyToken([zeroAddress, amount], {
          value: amount + uniswapTimestamp2,
        });
      }

      await publicClient.waitForTransactionReceipt({ hash });

      fetchTokenBalances();
      fetchLockedBalance();
      fetchTotalTokensSold();

      toast.success(
        `You have successfully purchased $${config.saleToken[chainId].symbol} Tokens. Thank you!`
      );

      success = true;
    } catch (error: any) {
      if (
        error?.error?.code === -32603 &&
        error?.error?.message.includes("reverted")
      ) {
        toast.error(error.error.message?.replace("execution reverted:", ""));
      } else toast.error("Signing failed, please try again!");
    }

    setLoading(false);

    return { success, txHash: hash };
  };

  const unlockingTokens = async () => {
    if (!signer) return;

    setLoading(true);

    try {
      const uniswapTimestamp = await presaleContract.read.uniswapTimestamp();
      const hash = await presaleContract.write.unlockToken({
        value: uniswapTimestamp,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      fetchLockedBalance();

      toast.success("Tokens unlocked successfully");
    } catch (error: any) {
      if (
        error?.error?.code === -32603 &&
        error?.error?.message.includes("reverted")
      ) {
        toast.error(error.error.message?.replace("execution reverted:", ""));
      } else toast.error("Signing failed, please try again!");
    }

    setLoading(false);
  };

  const addTokenAsset = async (token: Token) => {
    if (!token.address || !signer) return;
    try {
      await signer.watchAsset({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals ?? 18,
            image: token.image.includes("http")
              ? token.image
              : `${window.location.origin}${token.image}`,
          },
        },
      } as any);
      toast.success("Token imported to metamask successfully");
    } catch (e) {
      toast.error("Token import failed");
    }
  };

  const parse = (value: string | number) =>
    parseUnits(`${value}`, config.saleToken[chainId].decimals);

  const format = (value: bigint) =>
    formatUnits(value, config.saleToken[chainId].decimals);

  return {
    loading,
    parse,
    format,
    buyToken,
    addTokenAsset,
    fetchIntialData,
    unlockingTokens,
    fetchLockedBalance,
    fetchTokenBalances,
  };
};

export default useWeb3Functions;

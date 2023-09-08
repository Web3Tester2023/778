import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import config, { presaleStartTime } from "../config";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import useWeb3Functions from "../hooks/useWeb3Functions";
import Loading from "./Loading";
import { setCurrentChain } from "../store/presale";
import PresaleCountdown from "./PresaleCountdown";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const BuyForm = () => {
  const { t } = useTranslation();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const dispatch = useDispatch();
  const chainId = useSelector((state: RootState) => state.presale.chainId);
  const tokens = useSelector((state: RootState) => state.presale.tokens);
  const balances = useSelector((state: RootState) => state.wallet.balances);
  const tokenPrices = useSelector((state: RootState) => state.presale.prices);
  const saleStatus = useSelector(
    (state: RootState) => state.presale.saleStatus
  );
  const totalTokensSold = useSelector(
    (state: RootState) => state.presale.totalTokensSold + config.extraSoldAmount
  );
  const totalTokensForSale = useSelector(
    (state: RootState) => state.presale.totalTokensforSale
  );

  const tokenBalance = useSelector((state: RootState) => state.wallet.balances);
  const saleToken = config.saleToken;

  const [fromToken, setFromToken] = useState<Token>(tokens[chainId][0]);
  const [toToken, setToToken] = useState<Token>(
    saleToken[chainId as ChainId] as Token
  );

  const [fromValue, setFromValue] = useState<string | number>("");
  const [toValue, setToValue] = useState<string | number>("");

  const {
    buyToken,
    fetchIntialData,
    fetchLockedBalance,
    fetchTokenBalances,
    unlockingTokens,
    loading,
  } = useWeb3Functions();

  const { open } = useWeb3Modal();

  const { address, isConnected } = useAccount();

  const tokenPrice = useMemo(
    () => tokenPrices[config.displayPrice[chainId]] || 0,
    [tokenPrices]
  );

  const soldPercentage = useMemo(
    () =>
      totalTokensForSale ? (totalTokensSold / totalTokensForSale) * 100 : 0,
    [totalTokensSold, totalTokensForSale]
  );

  const fixedNumber = (num: number, decimals = 6) =>
    +parseFloat((+num).toFixed(decimals));

  const formatNumber = (num: number) =>
    Intl.NumberFormat().format(fixedNumber(num, 2));

  const lockedToken = useMemo(
    () => formatNumber(balances[toToken.symbol]),
    [balances]
  );

  const insufficientBalance = useMemo(() => {
    if (!fromValue) return false;
    return +fromValue > tokenBalance[fromToken.symbol];
  }, [fromValue, tokenBalance]);

  const fromValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      emptyValues();
      return;
    }

    setFromValue(fixedNumber(+value));
    if (tokenPrices[fromToken.symbol] !== 0) {
      setToValue(fixedNumber(+value / tokenPrices[fromToken.symbol], 4));
    }
  };

  const toValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      emptyValues();
      return;
    }

    setToValue(fixedNumber(+value, 4));
    if (tokenPrices[fromToken.symbol] !== 0) {
      setFromValue(fixedNumber(+value * tokenPrices[fromToken.symbol]));
    }
  };

  const emptyValues = () => {
    setFromValue("");
    setToValue("");
  };

  const submit = async (event: any) => {
    event.preventDefault();

    try {
      if (saleStatus) {
        if (+fromValue === 0) return;

        await buyToken(fromValue, fromToken);
        emptyValues();
      } else {
        await unlockingTokens();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!address || !chain) return;
    fetchLockedBalance();
    fetchTokenBalances();
  }, [address]);

  useEffect(() => {
    if (!isConnected || !chain) return;

    if (chain.unsupported) {
      switchNetwork?.(config.chains[0].id as number);
    } else {
      dispatch(setCurrentChain(chain.id as number));
    }
  }, [isConnected]);

  useEffect(() => {
    fetchIntialData();
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-lg self-stretch rounded-3xl bg-black shadow-xl border-gold"> {/* Changed background color and added border color */}
      {loading && <Loading className="z-50 rounded-3xl" />}

      <div className="flex flex-col items-center justify-center rounded-t-2xl bg-gold px-4 py-4 text-dark"> {/* Changed text color and background color */}
      <p className="-mt-6 mb-2 rounded-full bg-gold px-3 py-1 text-sm text-dark">
          {t("release-one-month-after-the-end-of-the-presale")}
        </p>
        {saleStatus ? (
          <>
            <PresaleCountdown endTime={config.presaleEndTime} />
            <div className="mb-2 mt-1 w-full">
              <div className="progress progress-infinite">
                <div className="progress-bar3" style={{ width: soldPercentage + "%" }}>
                </div>
              </div>
            </div>
            <p className="mb-2 text-xl font-bold">
              USDT {t("raised")}: ${formatNumber(totalTokensSold * tokenPrice)}{" "}
              / ${formatNumber(totalTokensForSale * tokenPrice)}
            </p>
            <p className="text-lg font-bold text-dark">
              {t("listing-price")}: ${tokenPrice}
            </p>
          </>
        ) : (
          <p className="my-2 text-xl font-bold text-dark">Unlocking your tokens</p>
        )}
      </div>
      <form onSubmit={submit} className="mb-4 mt-4 flex flex-col gap-3 px-4">
        <div className="relative mt-2 flex flex-col items-center justify-center">
          <hr className="absolute top-1 h-0.5 w-full bg-primary" />
          <span className="z-10 -mt-2 bg-gold px-4 font-bold text-dark pricecard">
            1 ${saleToken[chainId].symbol} = ${tokenPrice}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <img src="/img/tokens/BLCG.png" alt="polygon icon" className="h-6" />
          <p className="text-sm font-semibold text-white">
            {t("only-polygon-network-is-approved")}
          </p>
        </div>

        {saleStatus && (
          <>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {tokens[chainId].map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 py-2 px-2 transition-opacity duration-200 hover:opacity-75 ${
                    fromToken.symbol === token.symbol
                      ? "border-green-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => setFromToken(token)}
                >
                  <img
                    src={token.image}
                    alt={token.symbol}
                    className="h-7 w-7 object-contain"
                  />
                  <span className="text-sm text-gold">{token.symbol}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">
                {t("amount-in")}{" "}
                <span className="font-bold tracking-widest">
                  {fromToken.symbol}
                </span>{" "}
                {t("you-pay")}
              </label>
              <div
                className={`flex w-full overflow-hidden rounded-xl border-2 border-gray-300 text-xl ring-4 ring-transparent focus-within:border-primary/50 focus-within:ring-primary/20 ${
                  insufficientBalance
                    ? "!border-red-500/50 !text-red-400 !ring-red-500/20"
                    : ""
                }`}
              >
                <input
                  className="flex-1 py-3 px-3 outline-none"
                  type="number"
                  min={0}
                  step={0.00001}
                  placeholder="0.0"
                  value={fromValue}
                  onChange={fromValueChange}
                />
                <div className="flex items-center justify-center border-l-2 border-gray-300 bg-[#171718] px-4">
                  <img
                    src={fromToken.image}
                    alt={fromToken.name}
                    className="h-10 w-10 object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">
                {t("amount-in")}{" "}
                <span className="font-bold tracking-widest">
                  {toToken.symbol}
                </span>{" "}
                {t("you-receive")}
              </label>
              <div
                className={`flex w-full overflow-hidden rounded-xl border-2 border-gray-300 text-xl ring-4 ring-transparent focus-within:border-primary/50 focus-within:ring-primary/20 ${
                  insufficientBalance
                    ? "!border-red-500/50 !text-red-400 !ring-red-500/20"
                    : ""
                }`}
              >
                <input
                  className="flex-1 py-3 px-3 outline-none"
                  type="number"
                  min={0}
                  step={0.00001}
                  placeholder="0.0"
                  value={toValue}
                  onChange={toValueChange}
                />
                <div className="flex items-center justify-center border-l-2 border-gray-300 bg-[#121214] px-4">
                  <img
                    src={toToken.image}
                    alt={toToken.name}
                    className="h-10 w-10 object-contain"
                  />
                </div>
              </div>
            </div>

            {insufficientBalance && (
              <p className="text-sm text-red-500">
                {t(
                  "oops-it-looks-like-you-dont-have-enough-fromtoken-symbol-to-pay-for-that-transaction-please-reduce-the-amount-of-fromtoken-symbol-and-try-again",
                  [fromToken.symbol, fromToken.symbol]
                )}
              </p>
            )}
          </>
        )}

        {isConnected ? (
          <>
            <p className="-mx-4 border-y py-4 text-center text-sm font-medium uppercase text-gold">
              You have purchased {lockedToken} ${saleToken[chainId].symbol}{" "}
              Locked{" "}
            </p>
            <button
              className="relative flex w-full items-center justify-center gap-2 rounded-md bg-yellow-500 py-4 px-6 text-lg font-semibold text-white transition-opacity duration-200 hover:opacity-75 disabled:cursor-not-allowed disabled:from-gray-400 disabled:opacity-80 lg:text-xl"
              disabled={loading || insufficientBalance}
              type="submit"
            >
              {loading && (
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin fill-primary text-dark"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              )}
              {saleStatus ? t("buy-now", [toToken.symbol]) : "Unlock Tokens"}
            </button>
          </>
        ) : (
          <button
            className="relative flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 py-4 px-6 text-lg font-semibold text-dark transition-opacity duration-200 hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-80 lg:text-xl"
            disabled={loading}
            type="button"
            onClick={() => open()}
          >
            {loading && (
              <svg
                aria-hidden="true"
                className="h-5 w-5 animate-spin fill-primary text-gray-200"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            )}
            {t("connect-wallet")}
          </button>
        )}
      </form>
    </div>
  );
};

export default BuyForm;

import { goerli, mainnet, bsc } from "wagmi/chains";
export const presaleStartTime = 1686182400;
export const presaleEndTime = 1690848000;

const config = {
  chains: [bsc],
  defaultChainId: bsc.id,
  whitepaper: 'https://redbnb.pro/whitepaper',
  telegram: 'https://t.me/',
  twitter: 'https://twitter.com/',

  // july 31 2023 00:00:00 GMT
  presaleEndTime: 1690848000,

  extraSoldAmount: 105_126,

  presaleContract: {
    [bsc.id]: "0x2e3b6733A978Fe63eFdE637fD6dc1392108ACE9c",
    [goerli.id]: "0xAdD443da9e623a2436abCF315efe87a3f1557A15",
  } as { [key: number]: Address }, // presale contract address

  saleToken: {
    [bsc.id]: {
      address: "0x17Da6b0AdDa41A24f2B31c65AFd3037f8993f57b", // token address
      symbol: "BLCG", // token symbol
      name: "Billion Local Coin Gold", // token name
      image: "/img/tokens/BLCG.png", // token image
      decimals: 18, // token decimals
    },
    [goerli.id]: {
      address: "0xc9733C0D52cB3BC298DEb25c2753fFa51f9A1E78", // token address
      symbol: "$FUNMB", // token symbol
      name: "$FUNMB", // token name
      image: "/img/tokens/$FUNMB_Icon.svg", // token image
      decimals: 18, // token decimals
    },
  } as { [key: number]: Token },

  displayPrice: {
    [bsc.id]: "USDT",
    [goerli.id]: "USDT",
  } as { [key: number]: string },

  whitelistedTokens: {
    [bsc.id]: [
      {
        address: null,
        symbol: "BNB",
        name: "Binance Smart Chain",
        image: "/img/tokens/bnb.webp",
        decimals: 18,
      },
      {
        address: "0x55d398326f99059ff775485246999027b3197955",
        symbol: "USDT",
        name: "Tether USD",
        image: "/img/tokens/busdt_32.webp",
        decimals: 18,
      },
      {
        address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        symbol: "BUSD",
        name: "BUSD",
        image: "/img/tokens/busd.webp",
        decimals: 18,
      },
      {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        symbol: "USDC",
        name: "USDC",
        image: "/img/tokens/usdc.webp",
        decimals: 18,
      },
    ],
    [mainnet.id]: [
      {
        address: null,
        symbol: "ETH",
        name: "Ethereum",
        image: "/img/tokens/eth.svg",
        decimals: 18,
      },
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        symbol: "USDT",
        name: "Tether USD",
        image: "/img/tokens/tethernew_32.webp",
        decimals: 6,
      },
      {
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        name: "USDC",
        image: "/img/tokens/usdc.webp",
        decimals: 6,
      },
      {
        address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
        symbol: "BUSD",
        name: "BUSD",
        image: "/img/tokens/busd.webp",
        decimals: 18,
      },
    ],
  } as { [key: number]: Token[] },
};

export default config;

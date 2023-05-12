export enum Blockchain {
  DEFICHAIN = "DeFiChain",
  BITCOIN = "Bitcoin",
  ETHEREUM = "Ethereum",
  BINANCE_SMART_CHAIN = "BinanceSmartChain",
  OPTIMISM = "Optimism",
  ARBITRUM = "Arbitrum",
  POLYGON = "Polygon",
  CARDANO = "Cardano",
}

export const AllowedCryptoBlockchainsInput = [
  Blockchain.BITCOIN,
  Blockchain.ETHEREUM,
  Blockchain.BINANCE_SMART_CHAIN,
  Blockchain.ARBITRUM,
];

export const AllowedCryptoBlockchainsOutput = [Blockchain.BITCOIN, Blockchain.DEFICHAIN];

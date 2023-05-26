export enum Blockchain {
  DEFICHAIN = "DeFiChain",
  BITCOIN = "Bitcoin",
  LIGHTNING = "Lightning",
  ETHEREUM = "Ethereum",
  BINANCE_SMART_CHAIN = "BinanceSmartChain",
  OPTIMISM = "Optimism",
  ARBITRUM = "Arbitrum",
  POLYGON = "Polygon",
  CARDANO = "Cardano",
}

export const AllowedCryptoBlockchainsTarget = [
  Blockchain.BITCOIN,
  Blockchain.ETHEREUM,
  Blockchain.BINANCE_SMART_CHAIN,
  Blockchain.ARBITRUM,
];

export const AllowedCryptoBlockchainsSource = [Blockchain.BITCOIN, Blockchain.DEFICHAIN];

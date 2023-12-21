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
  MONERO = "Monero",
}

export const AllowedCryptoBlockchainsTarget = [
  Blockchain.BITCOIN,
  Blockchain.LIGHTNING,
  Blockchain.ETHEREUM,
  Blockchain.BINANCE_SMART_CHAIN,
  Blockchain.ARBITRUM,
  Blockchain.OPTIMISM,
  Blockchain.MONERO,
];

export const AllowedCryptoBlockchainsSource = [
  Blockchain.BITCOIN,
  Blockchain.LIGHTNING,
  Blockchain.ETHEREUM,
  Blockchain.ARBITRUM,
  Blockchain.OPTIMISM,
];

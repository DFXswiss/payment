import { Blockchain } from "./Blockchain";

export enum AssetType {
  COIN = "Coin",
  DAT = "DAT",
}

export enum AssetCategory {
  POOL_PAIR = "PoolPair",
  STOCK = "Stock",
  CRYPTO = "Crypto",
}

export interface Asset {
  id: number;
  chainId: number;
  type: AssetType;
  name: string;
  buyable: boolean;
  sellable: boolean;
  category: AssetCategory;
  blockchain: Blockchain;
}

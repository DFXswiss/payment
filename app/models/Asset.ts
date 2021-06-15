export enum AssetType {
  Coin = "Coin",
  DAT = "DAT"
}

export interface Asset {
  id: number;
  type: AssetType;
  name: string;
  buyable: boolean;
  sellable: boolean;
}
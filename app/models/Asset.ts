export type AssetType = "Coin" | "TODO";
// TODO: check swagger enum
// TODO: export to separate file?

export interface Asset {
  id: number;
  type: AssetType;
  name: string;
  buyable: boolean; // TODO: does this work? (getting 0/1 from API) => tell Yannick
  sellable: boolean;
}
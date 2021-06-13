import { Asset } from "./Asset";

export interface BuyRouteDto {
  id: string;
  address: string;
  asset: number;
  bank_usage: string;
  iban: string;
  active: boolean;
  created: string;
}

export interface BuyRoute {
  id: string;
  address: string;
  asset: Asset;
  bankUsage: string;
  iban: string;
  active: boolean;
  created: Date;
}

export const fromBuyRouteDto = (route: BuyRouteDto, assets: Asset[]): BuyRoute => ({
  id: route.id,
  address: route.address,
  asset: assets.find((a) => a.id === route.asset) as Asset, // TODO: through error?
  bankUsage: route.bank_usage,
  iban: route.iban,
  active: route.active,
  created: new Date(route.created),
});

export const toBuyRouteDto = (route: BuyRoute): BuyRouteDto => ({
  id: route.id,
  address: route.address,
  asset: route.asset.id,
  bank_usage: route.bankUsage,
  iban: route.iban,
  active: route.active,
  created: route.created.toString(),
});

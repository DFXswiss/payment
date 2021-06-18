import { Asset } from "./Asset";

// TODO: check
export interface NewBuyRouteDto {
  asset: string;
  iban: string;
}

export interface NewBuyRoute {
  assetId: number;
  iban: string;
}

export interface BuyRouteDto {
  id: string;
  address: string;
  asset: Asset;
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

export const fromBuyRouteDto = (route: BuyRouteDto): BuyRoute => ({
  id: route.id,
  address: route.address,
  asset: route.asset,
  bankUsage: route.bank_usage,
  iban: route.iban,
  active: route.active,
  created: new Date(route.created),
});

export const toBuyRouteDto = (route: BuyRoute): BuyRouteDto => ({
  id: route.id,
  address: route.address,
  asset: route.asset,
  bank_usage: route.bankUsage,
  iban: route.iban,
  active: route.active,
  created: route.created.toString(),
});

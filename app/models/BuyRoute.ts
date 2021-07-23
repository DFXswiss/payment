import { Asset } from "./Asset";

export interface BuyRouteDto {
  id: string;
  address: string;
  asset: Asset;
  bank_usage: string;
  iban: string;
  active: boolean;
}

export interface BuyRoute {
  id: string;
  address: string;
  asset: Asset;
  bankUsage: string;
  iban: string;
  active: boolean;
}

export const fromBuyRouteDto = (route: BuyRouteDto): BuyRoute => ({
  id: route.id,
  address: route.address,
  asset: route.asset,
  bankUsage: route.bank_usage,
  iban: route.iban,
  active: route.active,
});

export const toBuyRouteDto = (route: BuyRoute): BuyRouteDto => ({
  id: route.id,
  address: route.address,
  asset: route.asset,
  bank_usage: route.bankUsage,
  iban: route.iban,
  active: route.active,
});

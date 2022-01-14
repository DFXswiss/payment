import { Asset } from "./Asset";

export interface BuyRouteDto {
  id: string;
  address: string;
  asset: Asset;
  bankUsage: string;
  iban: string;
  volume: number;
  annualVolume: number;
  active: boolean;
}

export interface BuyRoute {
  id: string;
  address: string;
  asset: Asset;
  bankUsage: string;
  iban: string;
  volume: number;
  annualVolume: number;
  active: boolean;
}

export const fromBuyRouteDto = (route: BuyRouteDto): BuyRoute => ({
  id: route.id,
  address: route.address,
  asset: route.asset,
  bankUsage: route.bankUsage,
  iban: route.iban.replace(/(.{4})/g, "$1 "),
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
});

export const toBuyRouteDto = (route: BuyRoute): BuyRouteDto => ({
  id: route.id,
  address: route.address,
  asset: route.asset,
  bankUsage: route.bankUsage,
  iban: route.iban.split(" ").join(""),
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
});

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
  fee: number;
  refBonus: number;
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
  fee: number;
  refBonus: number;
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
  fee: route.fee,
  refBonus: route.refBonus,
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
  fee: route.fee,
  refBonus: route.refBonus,
});

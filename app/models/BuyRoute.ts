import { Asset } from "./Asset";
import { MinDeposit } from "./MinDeposit";

export interface BuyRouteDto {
  id: string;
  asset: Asset;
  bankUsage: string;
  iban: string;
  volume: number;
  annualVolume: number;
  active: boolean;
  fee: number;
  minDeposits: MinDeposit[];
}

export interface BuyRoute {
  id: string;
  asset: Asset;
  bankUsage: string;
  iban: string;
  volume: number;
  annualVolume: number;
  active: boolean;
  fee: number;
  minDeposits: MinDeposit[];
}

export const fromBuyRouteDto = (route: BuyRouteDto): BuyRoute => ({
  id: route.id,
  asset: route.asset,
  bankUsage: route.bankUsage,
  iban: route.iban.replace(/(.{4})/g, "$1 "),
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
  fee: route.fee,
  minDeposits: route.minDeposits,
});

export const toBuyRouteDto = (route: BuyRoute): BuyRouteDto => ({
  id: route.id,
  asset: route.asset,
  bankUsage: route.bankUsage,
  iban: route.iban.split(" ").join(""),
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
  fee: route.fee,
  minDeposits: route.minDeposits,
});

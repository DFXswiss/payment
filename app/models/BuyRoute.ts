import { Asset } from "./Asset";
import { MinAmount } from "./MinAmount";

export interface BuyRouteDto {
  id: string;
  asset: Asset;
  bankUsage: string;
  volume: number;
  annualVolume: number;
  active: boolean;
  fee: number;
  minDeposits: MinAmount[];
  minFee: MinAmount;
}

export interface BuyRoute {
  id: string;
  asset: Asset;
  bankUsage: string;
  volume: number;
  annualVolume: number;
  active: boolean;
  fee: number;
  minDeposits: MinAmount[];
  minFee: MinAmount;
}

export const fromBuyRouteDto = (route: BuyRouteDto): BuyRoute => ({
  id: route.id,
  asset: route.asset,
  bankUsage: route.bankUsage,
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
  fee: route.fee,
  minDeposits: route.minDeposits,
  minFee: route.minFee,
});

export const toBuyRouteDto = (route: BuyRoute): BuyRouteDto => ({
  id: route.id,
  asset: route.asset,
  bankUsage: route.bankUsage,
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
  fee: route.fee,
  minDeposits: route.minDeposits,
  minFee: route.minFee,
});

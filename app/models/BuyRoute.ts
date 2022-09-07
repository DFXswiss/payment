import { Asset } from "./Asset";
import { MinDeposit } from "./MinDeposit";
import { Blockchain } from "./Blockchain";
import { StakingRoute } from "./StakingRoute";

export enum BuyType {
  WALLET = "Wallet",
  STAKING = "Staking",
}

export interface BuyRouteDto {
  id: string;
  type: BuyType;
  asset?: Asset;
  staking?: StakingRoute;
  bankUsage: string;
  iban: string;
  volume: number;
  annualVolume: number;
  active: boolean;
  fee: number;
  refBonus: number;
  minDeposits: MinDeposit[];
}

export interface BuyRoute {
  id: string;
  type: BuyType;
  asset?: Asset;
  staking?: StakingRoute;
  bankUsage: string;
  iban: string;
  volume: number;
  annualVolume: number;
  active: boolean;
  fee: number;
  refBonus: number;
  minDeposits: MinDeposit[];
}

export const fromBuyRouteDto = (route: BuyRouteDto): BuyRoute => ({
  id: route.id,
  type: route.type,
  asset: route.asset,
  staking: route.staking,
  bankUsage: route.bankUsage,
  iban: route.iban.replace(/(.{4})/g, "$1 "),
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
  fee: route.fee,
  refBonus: route.refBonus,
  minDeposits: route.minDeposits,
});

export const toBuyRouteDto = (route: BuyRoute): BuyRouteDto => ({
  id: route.id,
  type: route.type,
  asset: route.asset,
  staking: route.staking,
  bankUsage: route.bankUsage,
  iban: route.iban.split(" ").join(""),
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
  fee: route.fee,
  refBonus: route.refBonus,
  minDeposits: route.minDeposits,
});

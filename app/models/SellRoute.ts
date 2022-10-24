import { Blockchain } from "./Blockchain";
import { Deposit } from "./Deposit";
import { Fiat } from "./Fiat";
import { MinDeposit } from "./MinDeposit";

export interface SellRouteDto {
  id: string;
  fiat: Fiat;
  deposit: Deposit;
  iban: string;
  volume: number;
  annualVolume: number;
  active: boolean;
  fee: number;
  isInUse: boolean;
  minDeposits: MinDeposit[];
}

export interface SellRoute {
  id: string;
  fiat: Fiat;
  deposit: Deposit;
  iban: string;
  volume: number;
  annualVolume: number;
  active: boolean;
  fee: number;
  isInUse: boolean;
  minDeposits: MinDeposit[];

  blockchain?: Blockchain;
}

export const fromSellRouteDto = (route: SellRouteDto): SellRoute => ({
  id: route.id,
  fiat: route.fiat,
  deposit: route.deposit,
  iban: route.iban.replace(/(.{4})/g, "$1 "),
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
  fee: route.fee,
  isInUse: route.isInUse,
  minDeposits: route.minDeposits,
});

export const toSellRouteDto = (route: SellRoute): SellRouteDto => ({
  id: route.id,
  fiat: route.fiat,
  deposit: route.deposit,
  iban: route.iban.split(" ").join(""),
  active: route.active,
  volume: route.volume,
  annualVolume: route.annualVolume,
  fee: route.fee,
  isInUse: route.isInUse,
  minDeposits: route.minDeposits,
});

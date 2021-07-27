import { Deposit } from "./Deposit";
import { Fiat } from "./Fiat";

export interface SellRouteDto {
  id: string;
  address: string;
  fiat: Fiat;
  deposit: Deposit;
  iban: string;
  active: boolean;
}

export interface SellRoute {
  id: string;
  address: string;
  fiat: Fiat;
  deposit: Deposit;
  iban: string;
  active: boolean;
}

export const fromSellRouteDto = (route: SellRouteDto): SellRoute => ({
  id: route.id,
  address: route.address,
  fiat: route.fiat,
  deposit: route.deposit,
  iban: route.iban,
  active: route.active,
});

export const toSellRouteDto = (route: SellRoute): SellRouteDto => ({
  id: route.id,
  address: route.address,
  fiat: route.fiat,
  deposit: route.deposit,
  iban: route.iban,
  active: route.active,
});

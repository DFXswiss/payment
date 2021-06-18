import { Fiat } from "./Fiat";

export interface SellRouteDto {
  id: string;
  address: string;
  fiat: Fiat;
  deposit_address: string;
  iban: string;
  active: boolean;
  created: string;
}

export interface SellRoute {
  id: string;
  address: string;
  fiat: Fiat;
  depositAddress: string;
  iban: string;
  active: boolean;
  created: Date;
}

export const fromSellRouteDto = (route: SellRouteDto): SellRoute => ({
  id: route.id,
  address: route.address,
  fiat: route.fiat,
  depositAddress: route.deposit_address,
  iban: route.iban,
  active: route.active,
  created: new Date(route.created),
});

export const toSellRouteDto = (route: SellRoute): SellRouteDto => ({
  id: route.id,
  address: route.address,
  fiat: route.fiat,
  deposit_address: route.depositAddress,
  iban: route.iban,
  active: route.active,
  created: route.created?.toString(),
});

import { Fiat } from "./Fiat";

export interface SellRouteDto { // TODO: getting fiat object!
  id: string;
  address: string;
  fiat: number;
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

export const fromSellRouteDto = (route: SellRouteDto, fiats: Fiat[]): SellRoute => ({
  id: route.id,
  address: route.address,
  fiat: fiats.find((f) => f.id === route.fiat) as Fiat, // TODO: through error?
  depositAddress: route.deposit_address,
  iban: route.iban,
  active: route.active,
  created: new Date(route.created),
});

export const toSellRouteDto = (route: SellRoute): SellRouteDto => ({
  id: route.id,
  address: route.address,
  fiat: route.fiat.id,
  deposit_address: route.depositAddress,
  iban: route.iban,
  active: route.active,
  created: route.created.toString(),
});

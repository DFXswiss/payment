export interface SellRoute {
  id: string;
  address: string;
  fiat: number; // TODO: map to fiat object
  deposit_address: string;
  iban: string;
  active: boolean;
  created: string;
}

export interface BuyRoute {
  id: string;
  address: string;
  asset: number; // TODO: map to asset object?
  bank_usage: string;
  iban: string;
  active: boolean;
  created: string;
}

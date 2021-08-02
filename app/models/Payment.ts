export interface Payment {
  iban: string;
  amount: number;
  fiat: string;
  userName: string;
  userAddress: string;
  userCountry: string;
  bankUsage: string;
}
export interface PaymentDto {
  iban: string;
  location: string;
  name: string;
  country: string;
  fiat: string;
  fiatValue: number;
  bankUsage: string;
  received: string;
}

export interface Payment {
  iban: string;
  currency: string;
  amount: number;
  userName: string;
  userAddress: string;
  userCountry: string;
  bankUsage: string;
  received: string;
}

export const toPaymentDto = (payment: Payment): PaymentDto => ({
  iban: payment.iban,
  fiat: payment.currency,
  fiatValue: payment.amount,
  name: payment.userName,
  location: payment.userAddress,
  country: payment.userCountry,
  bankUsage: payment.bankUsage,
  received: payment.received,
});
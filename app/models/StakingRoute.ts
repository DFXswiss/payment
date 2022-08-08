import { Asset } from "./Asset";
import { Deposit } from "./Deposit";
import { SellRoute } from "./SellRoute";

export enum PayoutType {
  REINVEST = "Reinvest",
  WALLET = "Wallet",
  BANK_ACCOUNT = "BankAccount",
}

export interface StakingRoute {
  id: string;
  active: boolean;
  deposit: Deposit;
  rewardType: PayoutType;
  rewardSell?: SellRoute;
  rewardAsset?: Asset;
  paybackType: PayoutType;
  paybackSell?: SellRoute;
  paybackAsset?: Asset;
  balance: number;
  rewardVolume: number;
  isInUse: boolean;
  fee: number;
  period: number;
  minInvestment: number;
  minDeposit: number;
}

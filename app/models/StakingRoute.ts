import { Deposit } from "./Deposit";
import { SellRoute } from "./SellRoute";

export enum StakingType {
  REINVEST = "Reinvest",
  WALLET = "Wallet",
  PAYOUT = "Payout",
}

export interface StakingRoute {
  id: string;
  active: boolean;
  deposit: Deposit;
  rewardType: StakingType;
  rewardSell?: SellRoute;
  paybackType: StakingType;
  paybackSell?: SellRoute;
  balance: number;
}

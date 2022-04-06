import { StakingType } from "./StakingRoute";

export interface StakingBatch {
  amount: number;
  outputDate: string;
  payoutType: StakingType;
}

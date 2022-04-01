import { StakingType } from "./StakingRoute";

export interface StakingBatch {
  amount: number;
  outputDate: Date;
  payoutType: StakingType;
}

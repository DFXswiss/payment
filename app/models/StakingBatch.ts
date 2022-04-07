import { PayoutType } from "./StakingRoute";

export interface StakingBatchDto {
  amount: number;
  outputDate: string;
  payoutType: PayoutType;
}

export interface StakingBatch {
  amount: number;
  outputDate: Date;
  payoutType: PayoutType;
}

export const fromStakingBatchDto = (batch: StakingBatchDto): StakingBatch => ({
  amount: batch.amount,
  outputDate: new Date(batch.outputDate),
  payoutType: batch.payoutType,
});

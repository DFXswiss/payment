import { Asset } from "./Asset";
import { Blockchain } from "./Blockchain";
import { Deposit } from "./Deposit";
import { StakingRoute } from "./StakingRoute";

export interface CryptoRoute {
  id: string;
  active: boolean;
  fee: number;
  type: string;
  blockchain: Blockchain;
  deposit: Deposit;
  asset?: Asset;
  staking?: StakingRoute;
  volume: number;
  annualVolume: number;
  refBonus: number;
}

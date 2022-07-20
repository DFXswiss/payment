import { Asset } from "./Asset";
import { Deposit } from "./Deposit";
import { StakingRoute } from "./StakingRoute";

export enum Blockchain {
  BITCOIN = "Bitcoin",
}

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
}

export const assignBlockchain = (route: CryptoRoute): CryptoRoute => {
  route.blockchain = Blockchain.BITCOIN
  return route
}

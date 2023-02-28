import { Asset } from "./Asset";
import { Blockchain } from "./Blockchain";
import { Deposit } from "./Deposit";
import { MinDeposit } from "./MinDeposit";

export interface CryptoRoute {
  id: string;
  active: boolean;
  fee: number;
  blockchain: Blockchain;
  deposit: Deposit;
  asset: Asset;
  volume: number;
  annualVolume: number;
  minDeposits: MinDeposit[];
}

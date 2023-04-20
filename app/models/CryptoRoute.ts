import { Asset } from "./Asset";
import { Blockchain } from "./Blockchain";
import { Deposit } from "./Deposit";
import { MinAmount } from "./MinAmount";

export interface CryptoRoute {
  id: string;
  active: boolean;
  fee: number;
  blockchain: Blockchain;
  deposit: Deposit;
  asset: Asset;
  volume: number;
  annualVolume: number;
  minDeposits: MinAmount[];
  minFee: MinAmount;
}

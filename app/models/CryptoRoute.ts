import { Asset } from "./Asset";
import { Deposit } from "./Deposit";
import { StakingRoute } from "./StakingRoute";

export enum Blockchains {
  BITCOIN = "Bitcoin",
}

export const availableBlockchains: Blockchain[] = [
  {id: 1, name: Blockchains.BITCOIN}
]

export interface Blockchain {
  id: number;
  name: string;
}

export interface CryptoRouteDto {
  id: string;
  active: boolean;
  fee: number;
  type: string;
  blockchain: string;
  deposit: Deposit;
  asset?: Asset;
  staking?: StakingRoute;
  volume: number;
  annualVolume: number;
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

export const fromCryptoRouteDto = (route: CryptoRouteDto): CryptoRoute => ({
  id: route.id,
  active: route.active,
  fee: route.fee,
  type: route.type,
  blockchain: toBlockchain(Blockchains.BITCOIN), // needs to be hardcoded, as we don't get this information from API
  deposit: route.deposit,
  asset: route.asset,
  staking: route.staking,
  volume: route.volume,
  annualVolume: route.annualVolume,
});

export const toCryptoRouteDto = (route: CryptoRoute): CryptoRouteDto => ({
  id: route.id,
  active: route.active,
  fee: route.fee,
  type: route.type,
  blockchain: fromBlockchain(route.blockchain),
  deposit: route.deposit,
  asset: route.asset,
  staking: route.staking,
  volume: route.volume,
  annualVolume: route.annualVolume,
});

// until we get this information from API, we are building a small mapping in here
const fromBlockchain = (blockchain?: Blockchain): string => {
  if (blockchain === undefined) {
    // currently easy to fallback, as there is only BITCOIN available, might change in future
    return Blockchains.BITCOIN
  }
  return blockchain.name;
};

const toBlockchain = (name: string): Blockchain => {
  return availableBlockchains.find((blockchain) => blockchain.name === name ) ?? availableBlockchains[0]
};

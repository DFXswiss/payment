export interface Statistic {
  totalVolume: {
    buy: number;
    sell: number;
  };
  totalRewards: {
    staking: number;
    ref: number;
  };
  status: { buy: string; sell: string };
}

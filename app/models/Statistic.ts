export interface Statistic {
  totalVolume: {
    buy: number;
    sell: number;
  };
  totalRewards: {
    staking: number;
    ref: number;
  };
  staking: {
    masternodes: number;
    yield: {
      apr: number;
      apy: number;
    };
  };
  status: { buy: string; sell: string; staking: string };
}

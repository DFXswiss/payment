export enum RouteHistoryType {
  BUY,
  SELL,
  CRYPTO,
}

export enum AmlCheck {
  PASS = "Pass",
  FAIL = "Fail",
  PENDING = "Pending",
}

export enum PaymentStatus {
  MISSING_LIQUIDITY = "MissingLiquidity",
  WAITING_FOR_LOWER_FEE = "WaitingForLowerFee",
  COMPLETE = "Complete",
}

export type RouteHistoryAlias = BuyRouteHistory | SellRouteHistory | CryptoRouteHistory;

export function attachType(type: RouteHistoryType, routes: RouteHistoryAlias[]): RouteHistoryAlias[] {
  routes.forEach((route) => {
    route.type = type;
  });
  return routes;
}

interface RouteHistory {
  type: RouteHistoryType;
  inputAmount: number;
  inputAsset: string;
  outputAmount: number;
  outputAsset: string;
  txId: string;
  txUrl: string;
  date: Date;
  amlCheck: AmlCheck;
  isComplete: boolean;
  status?: RouteHistoryStatus;
}

export interface BuyRouteHistory extends RouteHistory {}
export interface SellRouteHistory extends RouteHistory {}
export interface CryptoRouteHistory extends RouteHistory {}

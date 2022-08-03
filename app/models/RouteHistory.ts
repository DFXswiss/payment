import { AmlCheck } from "./User";

export enum RouteHistoryType {
  BUY,
  SELL,
  CRYPTO,
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
  date: Date;
  amlCheck: AmlCheck;
  isComplete: boolean;
}

export interface BuyRouteHistory extends RouteHistory {}
export interface SellRouteHistory extends RouteHistory {}
export interface CryptoRouteHistory extends RouteHistory {}

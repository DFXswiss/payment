import { Asset } from "./Asset";
import { Fiat } from "./Fiat";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "./BuyRoute";
import { fromSellRouteDto, SellRoute, SellRouteDto, toSellRouteDto } from "./SellRoute";

export interface PaymentRoutesDto {
  fiat2crypto: BuyRouteDto[];
  crypto2fiat: SellRouteDto[];
}

export interface PaymentRoutes {
  buyRoutes: BuyRoute[];
  sellRoutes: SellRoute[];
}

export const fromPaymentRoutesDto = (routes: PaymentRoutesDto, assets: Asset[], fiats: Fiat[]): PaymentRoutes => ({
  buyRoutes: routes.fiat2crypto.map((r) => fromBuyRouteDto(r, assets)),
  sellRoutes: routes.crypto2fiat.map((r) => fromSellRouteDto(r, fiats)),
});

export const toPaymentRoutesDto = (routes: PaymentRoutes): PaymentRoutesDto => ({
  fiat2crypto: routes.buyRoutes.map((r) => toBuyRouteDto(r)),
  crypto2fiat: routes.sellRoutes.map((r) => toSellRouteDto(r)),
});

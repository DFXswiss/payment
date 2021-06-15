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

export const fromPaymentRoutesDto = (routes: PaymentRoutesDto): PaymentRoutes => ({
  buyRoutes: routes.fiat2crypto.map((r) => fromBuyRouteDto(r)),
  sellRoutes: routes.crypto2fiat.map((r) => fromSellRouteDto(r)),
});

export const fromActivePaymentRoutesDto = (routes: PaymentRoutesDto): PaymentRoutes => ({
  buyRoutes: routes.fiat2crypto.filter((r) => r.active).map((r) => fromBuyRouteDto(r)),
  sellRoutes: routes.crypto2fiat.filter((r) => r.active).map((r) => fromSellRouteDto(r)),
});

export const toPaymentRoutesDto = (routes: PaymentRoutes): PaymentRoutesDto => ({
  fiat2crypto: routes.buyRoutes.map((r) => toBuyRouteDto(r)),
  crypto2fiat: routes.sellRoutes.map((r) => toSellRouteDto(r)),
});

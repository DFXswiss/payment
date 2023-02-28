import { BuyRoute, BuyRouteDto, fromBuyRouteDto } from "./BuyRoute";
import { CryptoRoute } from "./CryptoRoute";
import { fromSellRouteDto, SellRoute, SellRouteDto } from "./SellRoute";

export interface RoutesDto {
  buy: BuyRouteDto[];
  sell: SellRouteDto[];
  crypto: CryptoRoute[];
}

export interface Routes {
  buy: BuyRoute[];
  sell: SellRoute[];
  crypto: CryptoRoute[];
}

export const fromRoutesDto = (route: RoutesDto): Routes => ({
  buy: route.buy.map((b) => fromBuyRouteDto(b)),
  sell: route.sell.map((b) => fromSellRouteDto(b)),
  crypto: route.crypto,
});

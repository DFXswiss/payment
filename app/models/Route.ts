import { BuyRoute, BuyRouteDto, fromBuyRouteDto } from "./BuyRoute";
import { CryptoRoute } from "./CryptoRoute";
import { fromSellRouteDto, SellRoute, SellRouteDto } from "./SellRoute";
import { StakingRoute } from "./StakingRoute";

export interface RoutesDto {
  buy: BuyRouteDto[];
  sell: SellRouteDto[];
  staking: StakingRoute[];
  crypto: CryptoRoute[];
}

export interface Routes {
  buy: BuyRoute[];
  sell: SellRoute[];
  staking: StakingRoute[];
  crypto: CryptoRoute[];
}

export const fromRoutesDto = (route: RoutesDto): Routes => ({
  buy: route.buy.map((b) => fromBuyRouteDto(b)),
  sell: route.sell.map((b) => fromSellRouteDto(b)),
  staking: route.staking,
  crypto: route.crypto,
});

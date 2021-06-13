import { BuyRoute } from "./BuyRoute";
import { SellRoute } from "./SellRoute";

export interface PaymentRoutes {
    fiat2crypto: BuyRoute[];
    crypto2fiat: SellRoute[];
}
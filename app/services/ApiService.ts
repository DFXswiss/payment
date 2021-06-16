import { Environment } from "../env/Environment";
import { Asset } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "../models/BuyRoute";
import { Fiat } from "../models/Fiat";
import { fromActivePaymentRoutesDto, fromPaymentRoutesDto, PaymentRoutes, PaymentRoutesDto } from "../models/PaymentRoutes";
import { fromSellRouteDto, SellRoute, SellRouteDto, toSellRouteDto } from "../models/SellRoute";
import { fromUserDto, toUserDto, User, UserDto } from "../models/User";
import SessionService, { Credentials } from "./SessionService";

const BaseUrl = Environment.api.baseUrl;
const UserUrl = "user";
const BuyUrl = "fiat2crypto";
const SellUrl = "crypto2fiat";
const RouteUrl = "registration";
const AssetUrl = "asset";
const FiatUrl = "fiat";

// TODO: add delete routes method

// --- USER --- //
export const getUser = (): Promise<User> => {
  return SessionService.Credentials
    .then((credentials) => fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("GET", credentials)))
    .then((dto: UserDto) => fromUserDto(dto));
};

export const postUser = (user: User): Promise<User> => {
  return fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("POST", undefined, toUserDto(user))).then(
    (dto: UserDto) => fromUserDto(dto)
  );
};

export const putUser = (user: User): Promise<User> => {
  return SessionService.Credentials
    .then((credentials) =>
      fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}/${credentials.address}`, buildInit("PUT", credentials, toUserDto(user)))
    )
    .then((dto: UserDto) => fromUserDto(dto));
};

// --- PAYMENT ROUTES --- //
export const getRoutes = (): Promise<PaymentRoutes> => {
  return getRoutesDto()
    .then((routes) => fromPaymentRoutesDto(routes));
};

export const getActiveRoutes = (): Promise<PaymentRoutes> => {
  return getRoutesDto()
    .then((routes) => fromActivePaymentRoutesDto(routes));
};

const getRoutesDto = (): Promise<PaymentRoutesDto> => {
  return SessionService.Credentials
    .then((credentials) => fetchFrom<PaymentRoutesDto>(`${BaseUrl}/${RouteUrl}`, buildInit("GET", credentials)))
}

// TODO: use other DTO?
export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return SessionService.Credentials
    .then((credentials) => fetchFrom<BuyRouteDto>(`${BaseUrl}/${BuyUrl}`, buildInit("POST", credentials, toBuyRouteDto(route))))
    .then((dto) => fromBuyRouteDto(dto));
};

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return SessionService.Credentials
    .then((credentials) =>
      fetchFrom<SellRouteDto>(`${BaseUrl}/${SellUrl}`, buildInit("POST", credentials, toSellRouteDto(route)))
    )
    .then((dto) => fromSellRouteDto(dto));
};

// --- MASTER DATA --- //
export const getAssets = (): Promise<Asset[]> => {
  return fetchFrom<Asset[]>(`${BaseUrl}/${AssetUrl}`);
};

export const getFiats = (): Promise<Fiat[]> => {
  return fetchFrom<Fiat[]>(`${BaseUrl}/${FiatUrl}`);
};

// --- HELPERS --- //
const buildInit = (method: "GET" | "PUT" | "POST", credentials?: Credentials, data?: any): RequestInit => ({
  method: method,
  headers: {
    "Content-Type": "application/json",
    Authorization: credentials ? "Basic " + btoa(`${credentials.address}:${credentials.signature}`) : "",
  },
  body: JSON.stringify(data),
});

const fetchFrom = <T>(url: string, init?: RequestInit): Promise<T> => {
  return fetch(url, init).then((response) => response.json());
};

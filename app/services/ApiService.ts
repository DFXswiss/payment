import { Environment } from "../env/Environment";
import { Asset } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, NewBuyRoute } from "../models/BuyRoute";
import { Country } from "../models/Country";
import { Fiat } from "../models/Fiat";
import { fromActivePaymentRoutesDto, fromPaymentRoutesDto, PaymentRoutes, PaymentRoutesDto } from "../models/PaymentRoutes";
import { fromSellRouteDto, NewSellRoute, SellRoute, SellRouteDto } from "../models/SellRoute";
import { fromUserDto, NewUser, toNewUserDto, toUserDto, User, UserDto } from "../models/User";
import SessionService, { ICredentials } from "./SessionService";

const BaseUrl = Environment.api.baseUrl;
const UserUrl = "user";
const BuyUrl = "fiat2crypto";
const SellUrl = "crypto2fiat";
const RouteUrl = "registration";
const AssetUrl = "asset";
const FiatUrl = "fiat";
const CountryUrl = "country";

// TODO: add delete routes method

// --- USER --- //
export const getUser = (credentials?: ICredentials): Promise<User> => {
  return SessionService.Credentials
    .then((c) => fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("GET", credentials ?? c)))
    .then((dto: UserDto) => fromUserDto(dto));
};

export const postUser = (user: NewUser): Promise<User> => {
  return fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("POST", user, toNewUserDto(user)))
    .then((dto: UserDto) => fromUserDto(dto));
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
export const postBuyRoute = (route: NewBuyRoute): Promise<BuyRoute> => {
  return SessionService.Credentials
    .then((credentials) => fetchFrom<BuyRouteDto>(`${BaseUrl}/${BuyUrl}`, buildInit("POST", credentials, toBuyRouteDto(route))))
    .then((dto) => fromBuyRouteDto(dto));
};

export const postSellRoute = (route: NewSellRoute): Promise<SellRoute> => {
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

export const getCountries = (): Promise<Country[]> => {
  return fetchFrom<Country[]>(`${BaseUrl}/${CountryUrl}`);
};

// --- HELPERS --- //
const buildInit = (method: "GET" | "PUT" | "POST", credentials?: ICredentials, data?: any): RequestInit => ({
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

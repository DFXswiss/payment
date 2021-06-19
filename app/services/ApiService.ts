import { Environment } from "../env/Environment";
import { Asset } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "../models/BuyRoute";
import { Country } from "../models/Country";
import { Fiat } from "../models/Fiat";
import { fromActivePaymentRoutesDto, fromPaymentRoutesDto, PaymentRoutes, PaymentRoutesDto } from "../models/PaymentRoutes";
import { fromSellRouteDto, SellRoute, SellRouteDto, toSellRouteDto } from "../models/SellRoute";
import { fromUserDto, NewUser, toNewUserDto, toUserDto, User, UserDto } from "../models/User";
import AuthService, { ICredentials } from "./AuthService";

const BaseUrl = Environment.api.baseUrl;
const UserUrl = "user";
const BuyUrl = "fiat2crypto";
const SellUrl = "crypto2fiat";
const RouteUrl = "registration";
const AssetUrl = "asset";
const FiatUrl = "fiat";
const CountryUrl = "country";

// --- USER --- //
export const getUser = (credentials?: ICredentials): Promise<User> => {
  return AuthService.Credentials
    .then((c) => fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("GET", credentials ?? c)))
    .then((dto: UserDto) => fromUserDto(dto));
};

export const postUser = (user: NewUser): Promise<User> => {
  return fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("POST", user, toNewUserDto(user)))
    .then((dto: UserDto) => fromUserDto(dto));
};

export const putUser = (user: User): Promise<User> => {
  return AuthService.Credentials
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
  return AuthService.Credentials.then((credentials) =>
    fetchFrom<PaymentRoutesDto>(`${BaseUrl}/${RouteUrl}`, buildInit("GET", credentials))
  );
};

export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return AuthService.Credentials
    .then((credentials) => fetchFrom<BuyRouteDto>(`${BaseUrl}/${BuyUrl}`, buildInit("POST", credentials, toBuyRouteDto(route))))
    .then((dto) => fromBuyRouteDto(dto));
};

export const putBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return AuthService.Credentials
    .then((credentials) => fetchFrom<BuyRouteDto>(`${BaseUrl}/${BuyUrl}/${route.id}`, buildInit("PUT", credentials, toBuyRouteDto(route))))
    .then((dto) => fromBuyRouteDto(dto));
};

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return AuthService.Credentials
    .then((credentials) => fetchFrom<SellRouteDto>(`${BaseUrl}/${SellUrl}`, buildInit("POST", credentials, toSellRouteDto(route))) )
    .then((dto) => {console.log(dto); console.log(fromSellRouteDto(dto)); return fromSellRouteDto(dto)});
};

export const putSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return AuthService.Credentials
    .then((credentials) => fetchFrom<SellRouteDto>(`${BaseUrl}/${SellUrl}/${route.id}`, buildInit("PUT", credentials, toSellRouteDto(route))))
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

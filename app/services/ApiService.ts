import { Environment } from "../env/Environment";
import { AuthResponse } from "../models/ApiDto";
import { Asset, AssetType } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "../models/BuyRoute";
import { Country } from "../models/Country";
import { Fiat } from "../models/Fiat";
import { fromActivePaymentRoutesDto, fromPaymentRoutesDto, PaymentRoutes, PaymentRoutesDto } from "../models/PaymentRoutes";
import { fromSellRouteDto, SellRoute, SellRouteDto, toSellRouteDto } from "../models/SellRoute";
import { fromUserDto, NewUser, toNewUserDto, toUserDto, User, UserDto } from "../models/User";
import AuthService, { Credentials, Session } from "./AuthService";

const BaseUrl = Environment.api.baseUrl;
const AuthUrl = "auth";
const UserUrl = "user";
const BuyUrl = "fiat2crypto";
const SellUrl = "crypto2fiat";
const RouteUrl = "registration";
const AssetUrl = "asset";
const FiatUrl = "fiat";
const CountryUrl = "country";


// --- AUTH --- //
export const signIn = (credentials?: Credentials): Promise<string> => {
  return fetchFrom<AuthResponse>(`${BaseUrl}/${AuthUrl}/signIn`, "POST", credentials)
    .then((resp) => resp.accessToken);
};

export const signUp = (user: NewUser): Promise<string> => {
  return fetchFrom<AuthResponse>(`${BaseUrl}/${AuthUrl}/signUp`, "POST", toNewUserDto(user))
    .then((resp) => resp.accessToken);
}

// --- USER --- //
export const getUser = (): Promise<User> => {
  return fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`)
    .then((dto: UserDto) => fromUserDto(dto));
};

export const putUser = (user: User): Promise<User> => {
  return fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, "PUT", toUserDto(user))
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
  return fetchFrom<PaymentRoutesDto>(`${BaseUrl}/${RouteUrl}`);
};

export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return fetchFrom<BuyRouteDto>(`${BaseUrl}/${BuyUrl}`, "POST", toBuyRouteDto(route))
    .then((dto) => fromBuyRouteDto(dto));
};

export const putBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return fetchFrom<BuyRouteDto>(`${BaseUrl}/${BuyUrl}/${route.id}`, "PUT", toBuyRouteDto(route))
    .then((dto) => fromBuyRouteDto(dto));
};

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return fetchFrom<SellRouteDto>(`${BaseUrl}/${SellUrl}`, "POST", toSellRouteDto(route))
    .then((dto) => fromSellRouteDto(dto));
};

export const putSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return fetchFrom<SellRouteDto>(`${BaseUrl}/${SellUrl}/${route.id}`, "PUT", toSellRouteDto(route))
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
const fetchFrom = <T>(url: string, method: "GET" | "PUT" | "POST" = "GET", data?: any): Promise<T> => {
  return AuthService.Session
      .then((session) => buildInit(method, session, data))
      .then((init) => fetch(url, init))
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return response.json().then((body) => {
          throw body;
        });
      });
};

const buildInit = (method: "GET" | "PUT" | "POST", session: Session, data?: any): RequestInit => ({
  method: method,
  headers: {
    "Content-Type": "application/json",
    Authorization: session.accessToken ? "Bearer " + session.accessToken : "",
  },
  body: JSON.stringify(data),
});
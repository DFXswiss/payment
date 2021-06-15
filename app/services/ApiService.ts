import { Environment } from "../env/Environment";
import { Asset } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "../models/BuyRoute";
import { Fiat } from "../models/Fiat";
import { fromActivePaymentRoutesDto, fromPaymentRoutesDto, PaymentRoutes, PaymentRoutesDto } from "../models/PaymentRoutes";
import { fromSellRouteDto, SellRoute, SellRouteDto, toSellRouteDto } from "../models/SellRoute";
import { fromUserDto, toUserDto, User, UserDto } from "../models/User";
import { AppSettings, getSettings, updateSettings } from "./SettingsService";

const BaseUrl = Environment.api.baseUrl;
const UserUrl = "user";
const BuyUrl = "fiat2crypto";
const SellUrl = "crypto2fiat";
const RouteUrl = "registration";
const AssetUrl = "asset";
const FiatUrl = "fiat";

// TODO: remove dummy data
const Address = "8MVnL9PZ7yUoRMD4HAnTQn5DAHypYiv1yG";
const Signature = "Hwj3sJjBxMOnkPxZkGtqinGdASIOM6ffGDCcQsWA7kRIIjMP5/HMyuZwlLnBKuD6weD5c/8HIzMrmi6GpCmFU04=";

// TODO: add delete routes method

// --- SESSION --- //
export const isLoggedIn = (): Promise<boolean> => {
  return getSettings().then((settings) => !!settings.address);
};

// TODO: login with API
export const login = (): Promise<void> => {
  return updateSettings({ address: Address, signature: Signature });
};

export const logout = (): Promise<void> => {
  return updateSettings({ address: undefined, signature: undefined });
};

// --- USER --- //

export const getUser = (): Promise<User> => {
  return getSettings()
    .then((settings) => fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("GET", settings)))
    .then((dto: UserDto) => fromUserDto(dto));
};

export const postUser = (user: User): Promise<User> => {
  return fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("POST", undefined, toUserDto(user))).then(
    (dto: UserDto) => fromUserDto(dto)
  );
};

export const putUser = (user: User): Promise<User> => {
  return getSettings()
    .then((settings) =>
      fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}/${settings.address}`, buildInit("PUT", settings, toUserDto(user)))
    )
    .then((dto: UserDto) => fromUserDto(dto));
};

// --- PAYMENT ROUTES --- //
export const getRoutes = (): Promise<PaymentRoutes> => {
  return getSettings()
    .then((settings) => fetchFrom<PaymentRoutesDto>(`${BaseUrl}/${RouteUrl}`, buildInit("GET", settings)))
    .then((routes) => fromPaymentRoutesDto(routes));
};

export const getActiveRoutes = (): Promise<PaymentRoutes> => {
  return getSettings()
    .then((settings) => fetchFrom<PaymentRoutesDto>(`${BaseUrl}/${RouteUrl}`, buildInit("GET", settings)))
    .then((routes) => fromActivePaymentRoutesDto(routes));
};

// TODO: use other DTO?
export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return getSettings()
    .then((settings) =>
      fetchFrom<BuyRouteDto>(`${BaseUrl}/${BuyUrl}`, buildInit("POST", settings, toBuyRouteDto(route)))
    )
    .then((dto) => fromBuyRouteDto(dto));
};

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return getSettings()
    .then((settings) =>
      fetchFrom<SellRouteDto>(`${BaseUrl}/${SellUrl}`, buildInit("POST", settings, toSellRouteDto(route)))
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
const buildInit = (method: "GET" | "PUT" | "POST", settings?: AppSettings, data?: any): RequestInit => ({
  method: method,
  headers: {
    "Content-Type": "application/json",
    Authorization: settings ? "Basic " + btoa(`${settings.address}:${settings.signature}`) : "",
  },
  body: JSON.stringify(data),
});

const fetchFrom = <T>(url: string, init?: RequestInit): Promise<T> => {
  return fetch(url, init).then((response) => response.json());
};

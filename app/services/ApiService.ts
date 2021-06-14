import { Environment } from "../env/Environment";
import { Asset } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "../models/BuyRoute";
import { Fiat } from "../models/Fiat";
import { fromPaymentRoutesDto, PaymentRoutes, PaymentRoutesDto } from "../models/PaymentRoutes";
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

// TODO: delete routes method

// --- SESSION --- //
export const isLoggedIn = (): Promise<boolean> => {
  return getSettings().then((settings) => !!settings.address);
};

// TODO
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
    .then((dto: UserDto) => fromUserDto(dto))
    .catch(); // TODO: error handling?
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
export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return Promise.all([
    getSettings().then((settings) =>
      fetchFrom<BuyRouteDto>(
        `${BaseUrl}/${UserUrl}/${settings.address}/${BuyUrl}`,
        buildInit("POST", settings, toBuyRouteDto(route))
      )
    ),
    getAssets(),
  ]).then(([dto, assets]) => fromBuyRouteDto(dto, assets));
};

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return Promise.all([
    getSettings().then((settings) =>
      fetchFrom<SellRouteDto>(
        `${BaseUrl}/${UserUrl}/${settings.address}/${SellUrl}`,
        buildInit("POST", settings, toSellRouteDto(route))
      )
    ),
    getFiats(),
  ]).then(([dto, fiats]) => fromSellRouteDto(dto, fiats));
};

export const getRoutes = (): Promise<PaymentRoutes> => {
  return Promise.all([
    getSettings().then((settings) =>
      fetchFrom<PaymentRoutesDto>(`${BaseUrl}/${UserUrl}/${settings.address}/${RouteUrl}`, buildInit("GET", settings))
    ),
    getAssets(),
    getFiats(),
  ]).then(([routes, assets, fiats]) => fromPaymentRoutesDto(routes, assets, fiats));
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

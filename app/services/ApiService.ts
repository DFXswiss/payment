import { Environment } from "../env/Environment";
import { Asset } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "../models/BuyRoute";
import { Fiat } from "../models/Fiat";
import { fromPaymentRoutesDto, PaymentRoutes, PaymentRoutesDto } from "../models/PaymentRoutes";
import { fromSellRouteDto, SellRoute, SellRouteDto, toSellRouteDto } from "../models/SellRoute";
import { fromUserDto, toUserDto, User, UserDto } from "../models/User";
import { getSettings, updateSettings } from "./SettingsService";

const BaseUrl = Environment.api.baseUrl;
const UserUrl = "user";
const BuyUrl = "fiat2crypto";
const SellUrl = "crypto2fiat";
const RouteUrl = "registrations"; // TODO: tell Yannick => inconsistency
const AssetUrl = "assets";
const FiatUrl = "fiat";

// TODO: remove dummy data
const Address = "8MTm4jQ2FHbrxZRbbKkTWgAHYv5hCASU22";
const Signature = "IMFmkM25tqVtrva3m7xFd+py91i7q/23FJ8bSl7No0VgVcQo4ATV19+XoS+tLlydtS1gj2zl0Zb0XL2GDj/bw22=";
const DummyUser: UserDto = {
  IP: "192.192.192.192",
  address: "8MTm4jQ2FHbrxZRbbKkTWgAHYv5hCASU22",
  created: "2021-06-09T12:59:03",
  firstname: "David",
  location: "",
  mail: "test@google.com",
  phone_number: "",
  ref: "000-005",
  signature: "  ",
  street: "",
  surname: "",
  used_ref: "010-000",
  wallet_id: 0,
  zip: "",
};

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
  // TODO: remove
  return new Promise((resolve) => {
    setTimeout(() => resolve(fromUserDto(DummyUser)), 1000);
  });

  return getSettings()
    .then((settings) => fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}/${settings.address}?signature=${settings.signature}`))
    .then((dto: UserDto) => fromUserDto(dto))
    .catch(); // TODO: error handling?
};

export const postUser = (user: User): Promise<User> => {
  return fetchFrom<UserDto>(`${BaseUrl}/${UserUrl}`, buildInit("POST", toUserDto(user))).then((dto: UserDto) =>
    fromUserDto(dto)
  );
};

export const putUser = (user: User): Promise<User> => {
  return getSettings()
    .then((settings) =>
      fetchFrom<UserDto>(
        `${BaseUrl}/${UserUrl}/${settings.address}?signature=${settings.signature}`,
        buildInit("PUT", toUserDto(user))
      )
    )
    .then((dto: UserDto) => fromUserDto(dto));
};

// --- PAYMENT ROUTES --- //
export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return Promise.all([
    getSettings().then((settings) =>
      fetchFrom<BuyRouteDto>(
        `${BaseUrl}/${UserUrl}/${settings.address}/${BuyUrl}?signature=${settings.signature}`,
        buildInit("POST", toBuyRouteDto(route))
      )
    ),
    getAssets(),
  ]).then(([dto, assets]) => fromBuyRouteDto(dto, assets));
};

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return Promise.all([
    getSettings().then((settings) =>
      fetchFrom<SellRouteDto>(
        `${BaseUrl}/${UserUrl}/${settings.address}/${SellUrl}?signature=${settings.signature}`,
        buildInit("POST", toSellRouteDto(route))
      )
    ),
    getFiats(),
  ]).then(([dto, fiats]) => fromSellRouteDto(dto, fiats));
};

export const getRoutes = (): Promise<PaymentRoutes> => {
  // TODO: remove
  return Promise.resolve({ buyRoutes: [], sellRoutes: [] });

  return Promise.all([
    getSettings().then((settings) =>
      fetchFrom<PaymentRoutesDto>(
        `${BaseUrl}/${UserUrl}/${settings.address}/${RouteUrl}?signature=${settings.signature}`
      )
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
const buildInit = (method: "PUT" | "POST", data: any): RequestInit => ({
  method: method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});

const fetchFrom = <T>(url: string, init?: RequestInit): Promise<T> => {
  return fetch(url, init).then((response) => response.json());
};

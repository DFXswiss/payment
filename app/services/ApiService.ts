import { Environment } from "../env/Environment";
import { Asset } from "../models/Asset";
import { BuyRoute } from "../models/BuyRoute";
import { Fiat } from "../models/Fiat";
import { PaymentRoutes } from "../models/PaymentRoutes";
import { SellRoute } from "../models/SellRoute";
import { User } from "../models/User";

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
const DummyUser: User = {
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

const buildOptions = (method: "PUT" | "POST", data: any): RequestInit => {
  return {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
};

// --- USER --- //
export const getUser = (): Promise<User> => {
  // TODO: remove
  return new Promise((resolve) => {
    setTimeout(() => resolve(DummyUser), 1000);
  });

  return fetch(`${BaseUrl}/${UserUrl}/${Address}?signature=${Signature}`)
    .then((response) => response.json())
    .catch(); // TODO: error handling?
};

export const postUser = (user: User): Promise<User> => {
  // TODO: verify return type
  return fetch(`${BaseUrl}/${UserUrl}`, buildOptions("POST", user))
    .then((response) => response.json());
};

export const putUser = (user: User): Promise<User> => {
  // TODO: verify return type
  return fetch(`${BaseUrl}/${UserUrl}/${Address}?signature=${Signature}`, buildOptions("PUT", user))
    .then((response) => response.json());
};

// --- PAYMENT ROUTES --- //
export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  // TODO: verify return type
  return fetch(`${BaseUrl}/${UserUrl}/${Address}/${BuyUrl}?signature=${Signature}`, buildOptions("POST", route))
    .then((response) => response.json());
};

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  // TODO: verify return type
  return fetch(`${BaseUrl}/${UserUrl}/${Address}/${SellUrl}?signature=${Signature}`, buildOptions("POST", route))
    .then((response) => response.json());
};

export const getRoutes = (): Promise<PaymentRoutes> => {
  // TODO: verify return type
  return fetch(`${BaseUrl}/${UserUrl}/${Address}/${RouteUrl}?signature=${Signature}`)
    .then((response) => response.json());
};

// --- MASTER DATA --- //
export const getAssets = (): Promise<Asset[]> => {
  return fetch(`${BaseUrl}/${AssetUrl}`)
    .then((response) => response.json());
};

export const getFiat = (): Promise<Fiat[]> => {
  return fetch(`${BaseUrl}/${FiatUrl}`)
    .then((response) => response.json());
};

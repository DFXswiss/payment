import { Environment } from "../env/Environment";
import { ApiError, AuthResponse } from "../models/ApiDto";
import { Asset } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "../models/BuyRoute";
import { CfpResult } from "../models/CfpResult";
import { Country } from "../models/Country";
import { Fiat } from "../models/Fiat";
import { Language } from "../models/Language";
import { Ref } from "../models/Ref";
import { fromSellRouteDto, SellRoute, SellRouteDto, toSellRouteDto } from "../models/SellRoute";
import { fromUserDetailDto, fromUserDto, NewUser, toNewUserDto, toUserDto, User, UserDetail, UserDetailDto, UserDto } from "../models/User";
import AuthService, { Credentials, Session } from "./AuthService";

const BaseUrl = Environment.api.baseUrl;
const AuthUrl = "auth";
const UserUrl = "user";
const RefUrl = "ref";
const BuyUrl = "buy";
const SellUrl = "sell";
const AssetUrl = "asset";
const FiatUrl = "fiat";
const CountryUrl = "country";
const LanguageUrl = "language";
const BankTxUrl = "bankTx";
const StatisticUrl = "statistic";

// --- AUTH --- //
export const signIn = (credentials?: Credentials): Promise<string> => {
  return fetchFrom<AuthResponse>(`${AuthUrl}/signIn`, "POST", credentials)
    .then((resp) => resp.accessToken);
};

export const signUp = (user: NewUser): Promise<string> => {
  return fetchFrom<AuthResponse>(`${AuthUrl}/signUp`, "POST", toNewUserDto(user))
    .then((resp) => resp.accessToken);
}

// --- USER --- //
export const getUser = (): Promise<User> => {
  return fetchFrom<UserDto>(UserUrl)
    .then(fromUserDto);
};

export const getUserDetail = (): Promise<UserDetail> => {
  return fetchFrom<UserDetailDto>(`${UserUrl}/detail`)
    .then(fromUserDetailDto);
};

export const postKyc = (limit?: number): Promise<void> => {
  let url = `${UserUrl}/kyc`;
  if (limit) url += `?depositLimit=${limit}`;
  
  return fetchFrom(url, "POST");
};
export const putUser = (user: User): Promise<User> => {
  return fetchFrom<UserDto>(UserUrl, "PUT", toUserDto(user))
    .then(fromUserDto);
};

export const putUserLanguage = (language: Language): Promise<void> => {
  return AuthService.Session
    .then((session) => fetchFrom<void>(UserUrl, "PUT", { address: session.address, language }));
};

export const getRefCode = (): Promise<string> => {
  return fetchFrom<Ref>(RefUrl)
    .then((res) => res.ref);
}

// --- PAYMENT ROUTES --- //
export const getBuyRoutes = (): Promise<BuyRoute[]> => {
  return fetchFrom<BuyRouteDto[]>(BuyUrl)
    .then((dtoList) => dtoList.map(dto => fromBuyRouteDto(dto)));
}

export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return fetchFrom<BuyRouteDto>(BuyUrl, "POST", toBuyRouteDto(route))
    .then(fromBuyRouteDto);
};

export const putBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return fetchFrom<BuyRouteDto>(BuyUrl, "PUT", toBuyRouteDto(route))
    .then(fromBuyRouteDto);
};

export const getSellRoutes = (): Promise<SellRoute[]> => {
  return fetchFrom<SellRouteDto[]>(SellUrl)
    .then((dtoList) => dtoList.map(dto => fromSellRouteDto(dto)));
}

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return fetchFrom<SellRouteDto>(SellUrl, "POST", toSellRouteDto(route))
    .then(fromSellRouteDto);
};

export const putSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return fetchFrom<SellRouteDto>(SellUrl, "PUT", toSellRouteDto(route))
    .then(fromSellRouteDto);
};

// --- PAYMENT --- //
export const postSepaFiles = (files: File[]): Promise<void> => {
  const formData = new FormData();
  for (const key in files) {
    formData.append("files", files[key]);
  }
  return fetchFrom(BankTxUrl, "POST", formData, true);
};

// --- STATISTIC --- //
export const getCfpResults = (): Promise<CfpResult[]> => {
  return fetchFrom(`${StatisticUrl}/cfp/2109`);
};

// --- MASTER DATA --- //
export const getAssets = (): Promise<Asset[]> => {
  return fetchFrom<Asset[]>(AssetUrl);
};

export const getFiats = (): Promise<Fiat[]> => {
  return fetchFrom<Fiat[]>(FiatUrl);
};

export const getCountries = (): Promise<Country[]> => {
  return fetchFrom<Country[]>(CountryUrl)
    .then((countries) => countries.sort((a, b) => a.name > b.name ? 1 : -1));
};

export const getLanguages = (): Promise<Language[]> => {
  return fetchFrom<Language[]>(LanguageUrl);
};

// --- HELPERS --- //
const fetchFrom = <T>(
  url: string,
  method: "GET" | "PUT" | "POST" = "GET",
  data?: any,
  noJson?: boolean
): Promise<T> => {
  return (
    AuthService.Session.then((session) => buildInit(method, session, data, noJson))
      .then((init) => fetch(`${BaseUrl}/${url}`, init))
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return response.json().then((body) => {
          throw body;
        });
      })
      // TODO: this throws state update error (on HomeScreen)
      .catch((error: ApiError) => {
        if (error.statusCode === 401) {
          AuthService.deleteSession();
        }

        throw error;
      })
  );
};

const buildInit = (method: "GET" | "PUT" | "POST", session: Session, data?: any, noJson?: boolean): RequestInit => ({
  method: method,
  headers: {
    ...(noJson ? undefined : { "Content-Type": "application/json" }),
    Authorization: session.accessToken ? "Bearer " + session.accessToken : "",
  },
  body: noJson ? data : JSON.stringify(data),
});

import { History } from "../models/History";
import { Statistic } from "../models/Statistic";
import { Environment } from "../env/Environment";
import { ApiError, AuthResponse } from "../models/ApiDto";
import { Asset } from "../models/Asset";
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from "../models/BuyRoute";
import { CfpResult } from "../models/CfpResult";
import { Country } from "../models/Country";
import { Fiat } from "../models/Fiat";
import { Language } from "../models/Language";
import { fromSellRouteDto, SellRoute, SellRouteDto, toSellRouteDto } from "../models/SellRoute";
import {
  CfpVotes,
  fromUserDetailDto,
  fromUserDto,
  KycInfo,
  NewUser,
  toUserDto,
  User,
  UserDetail,
  UserDetailDto,
  UserDto,
} from "../models/User";
import AuthService, { Credentials, Session } from "./AuthService";
import { StakingRoute } from "../models/StakingRoute";
import { RoutesDto, fromRoutesDto, Routes } from "../models/Route";
import { LimitRequest } from "../models/LimitRequest";
import { KycData, toKycDataDto } from "../models/KycData";
import { Settings } from "../models/Settings";
import { HistoryType } from "../models/HistoryType";
import { fromStakingBatchDto, StakingBatch, StakingBatchDto } from "../models/StakingBatch";
import { ApiKey } from "../models/ApiKey";
import { CryptoRoute } from "../models/CryptoRoute";
import { attachType, CryptoRouteHistory, RouteHistoryType } from "../models/RouteHistory";
import { SellRouteHistory } from "../models/RouteHistory";
import { BuyRouteHistory } from "../models/RouteHistory";
import { LinkDto } from "../models/Link";

const BaseUrl = Environment.api.baseUrl;
const AuthUrl = "auth";
const UserUrl = "user";
const KycUrl = "kyc";
const BuyUrl = "buy";
const RouteUrl = "route";
const SellUrl = "sell";
const StakingUrl = "staking";
const CryptoRouteUrl = "cryptoRoute";
const HistoryUrl = "history";
const AssetUrl = "asset";
const FiatUrl = "fiat";
const CountryUrl = "country";
const LanguageUrl = "language";
const BankTxUrl = "bankTx";
const StatisticUrl = "statistic";
const SettingUrl = "setting/frontend";
const LinkUrl = "link";

// --- AUTH --- //
export const signIn = (credentials?: Credentials): Promise<string> => {
  return fetchFrom<AuthResponse>(`${AuthUrl}/signIn`, "POST", credentials).then((resp) => resp.accessToken);
};

export const signUp = (user: NewUser): Promise<string> => {
  return fetchFrom<AuthResponse>(`${AuthUrl}/signUp`, "POST", user).then((resp) => resp.accessToken);
};

// --- USER --- //
export const getUser = (): Promise<User> => {
  return fetchFrom<UserDto>(UserUrl).then(fromUserDto);
};

export const getUserDetail = (): Promise<UserDetail> => {
  return fetchFrom<UserDetailDto>(`${UserUrl}/detail`).then(fromUserDetailDto);
};

export const putUser = (user: User): Promise<UserDetail> => {
  return fetchFrom<UserDetailDto>(UserUrl, "PUT", toUserDto(user)).then(fromUserDetailDto);
};

export const putUserLanguage = (language: Language): Promise<void> => {
  return AuthService.Session.then((session) => fetchFrom<void>(UserUrl, "PUT", { address: session.address, language }));
};

export const updateRefFee = (fee: number): Promise<void> => {
  return fetchFrom(UserUrl, "PUT", { refFeePercent: fee });
};

export const generateApiKey = (types?: HistoryType[]): Promise<ApiKey> => {
  return fetchFrom<ApiKey>(`${UserUrl}/apiKey/CT${toHistoryQuery(types)}`, "POST");
};

export const deleteApiKey = (): Promise<void> => {
  return fetchFrom<void>(`${UserUrl}/apiKey/CT`, "DELETE");
};

export const putApiKeyFilter = (types?: HistoryType[]): Promise<HistoryType[]> => {
  return fetchFrom<HistoryType[]>(`${UserUrl}/apiFilter/CT${toHistoryQuery(types)}`, "PUT");
};

// --- KYC --- //
export const putKycData = (data: KycData, code?: string): Promise<KycInfo> => {
  return fetchFrom<KycInfo>(`${KycUrl}/${code}/data`, "PUT", toKycDataDto(data));
};

export const postKyc = (code?: string): Promise<KycInfo> => {
  return fetchFrom<KycInfo>(`${KycUrl}/${code}`, "POST");
};

export const getKyc = (code?: string): Promise<KycInfo> => {
  return fetchFrom<KycInfo>(`${KycUrl}/${code}`);
};

export const postLimit = (request: LimitRequest, code?: string): Promise<LimitRequest> => {
  return fetchFrom<LimitRequest>(`${KycUrl}/${code}/limit`, "POST", request);
};

export const postFounderCertificate = (files: File[], code?: string): Promise<void> => {
  return postFiles(`${KycUrl}/${code}/incorporationCertificate`, files);
};

// --- VOTING --- //
export const getSettings = (): Promise<Settings> => {
  return fetchFrom<Settings>(SettingUrl);
};

export const getCfpVotes = (): Promise<CfpVotes> => {
  return fetchFrom<CfpVotes>(`${UserUrl}/cfpVotes`);
};

export const putCfpVotes = (votes: CfpVotes): Promise<CfpVotes> => {
  return fetchFrom<CfpVotes>(`${UserUrl}/cfpVotes`, "PUT", votes);
};

// --- PAYMENT ROUTES --- //
export const getRoutes = (): Promise<Routes> => {
  return fetchFrom<RoutesDto>(RouteUrl).then(fromRoutesDto);
};

export const getBuyRoutes = (): Promise<BuyRoute[]> => {
  return fetchFrom<BuyRouteDto[]>(BuyUrl).then((dtoList) => dtoList.map((dto) => fromBuyRouteDto(dto)));
};

export const postBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return fetchFrom<BuyRouteDto>(BuyUrl, "POST", toBuyRouteDto(route)).then(fromBuyRouteDto);
};

export const putBuyRoute = (route: BuyRoute): Promise<BuyRoute> => {
  return fetchFrom<BuyRouteDto>(`${BuyUrl}/${route.id}`, "PUT", toBuyRouteDto(route)).then(fromBuyRouteDto);
};

export const getBuyRouteHistory = (route: BuyRoute): Promise<BuyRouteHistory[]> => {
  return fetchFrom<BuyRouteHistory[]>(`${BuyUrl}/${route.id}/history`).then((history) =>
    attachType(RouteHistoryType.BUY, history)
  );
};

export const getSellRoutes = (): Promise<SellRoute[]> => {
  return fetchFrom<SellRouteDto[]>(SellUrl).then((dtoList) => dtoList.map((dto) => fromSellRouteDto(dto)));
};

export const postSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return fetchFrom<SellRouteDto>(SellUrl, "POST", toSellRouteDto(route)).then(fromSellRouteDto);
};

export const putSellRoute = (route: SellRoute): Promise<SellRoute> => {
  return fetchFrom<SellRouteDto>(`${SellUrl}/${route.id}`, "PUT", toSellRouteDto(route)).then(fromSellRouteDto);
};

export const getSellRouteHistory = (route: SellRoute): Promise<SellRouteHistory[]> => {
  return fetchFrom<SellRouteHistory[]>(`${SellUrl}/${route.id}/history`).then((history) =>
    attachType(RouteHistoryType.SELL, history)
  );
};

export const getStakingRoutes = (): Promise<StakingRoute[]> => {
  return fetchFrom<StakingRoute[]>(StakingUrl);
};

export const postStakingRoute = (route: StakingRoute): Promise<StakingRoute> => {
  return fetchFrom<StakingRoute>(StakingUrl, "POST", route);
};

export const putStakingRoute = (route: StakingRoute): Promise<StakingRoute> => {
  return fetchFrom<StakingRoute>(`${StakingUrl}/${route.id}`, "PUT", route);
};

export const getStakingBatches = (route: StakingRoute): Promise<StakingBatch[]> => {
  return fetchFrom<StakingBatchDto[]>(`${StakingUrl}/${route?.id}/batches`).then((dtoList) =>
    dtoList.map((dto) => fromStakingBatchDto(dto))
  );
};

export const postCryptoRoute = (route: CryptoRoute): Promise<CryptoRoute> => {
  return fetchFrom<CryptoRoute>(CryptoRouteUrl, "POST", route);
};

export const putCryptoRoute = (route: CryptoRoute): Promise<CryptoRoute> => {
  return fetchFrom<CryptoRoute>(`${CryptoRouteUrl}/${route.id}`, "PUT", route);
};

export const getCryptoRouteHistory = (route: CryptoRoute): Promise<CryptoRouteHistory[]> => {
  return fetchFrom<CryptoRouteHistory[]>(`${CryptoRouteUrl}/${route.id}/history`).then((history) =>
    attachType(RouteHistoryType.CRYPTO, history)
  );
};

export const getHistory = (types?: HistoryType[]): Promise<History[]> => {
  return fetchFrom<History[]>(`${HistoryUrl}${toHistoryQuery(types)}`);
};

export const createHistoryCsv = (types?: HistoryType[]): Promise<number> => {
  return fetchFrom(`${HistoryUrl}/csv${toHistoryQuery(types)}`, "POST");
};

const toHistoryQuery = (types?: HistoryType[]) => (types ? "?" + Object.values(types).join("&") : "");

// --- PAYMENT --- //
export const postSepaFiles = (files: File[]): Promise<void> => {
  return postFiles(BankTxUrl, files);
};

// --- STATISTIC --- //
export const getStatistic = (): Promise<Statistic> => {
  return fetchFrom<Statistic>(StatisticUrl);
};

export const getCfpResults = (voting: string): Promise<CfpResult[]> => {
  return fetchFrom(`${StatisticUrl}/cfp/${voting}`);
};

// --- LINK --- //
export const postLink = (link: LinkDto): Promise<void> => {
  return fetchFrom(LinkUrl, "POST", link);
};

// --- MASTER DATA --- //
export const getAssets = (): Promise<Asset[]> => {
  return fetchFrom<Asset[]>(AssetUrl);
};

export const getFiats = (): Promise<Fiat[]> => {
  return fetchFrom<Fiat[]>(FiatUrl);
};

export const getCountries = (): Promise<Country[]> => {
  return fetchFrom<Country[]>(CountryUrl).then((countries) => countries.sort((a, b) => (a.name > b.name ? 1 : -1)));
};

export const getLanguages = (): Promise<Language[]> => {
  return fetchFrom<Language[]>(LanguageUrl);
};

// --- HELPERS --- //
const postFiles = (url: string, files: File[]): Promise<void> => {
  const formData = new FormData();
  for (const key in files) {
    formData.append("files", files[key]);
  }
  return fetchFrom(url, "POST", formData, true);
};

const fetchFrom = <T>(
  url: string,
  method: "GET" | "PUT" | "POST" | "DELETE" = "GET",
  data?: any,
  noJson?: boolean
): Promise<T> => {
  return (
    AuthService.Session.then((session) => buildInit(method, session, data, noJson))
      .then((init) => fetch(`${BaseUrl}/${url}`, init))
      .then((response) => {
        if (response.ok) {
          return response.json().catch(() => undefined);
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

const buildInit = (
  method: "GET" | "PUT" | "POST" | "DELETE",
  session: Session,
  data?: any,
  noJson?: boolean
): RequestInit => ({
  method: method,
  headers: {
    ...(noJson ? undefined : { "Content-Type": "application/json" }),
    Authorization: session.accessToken ? "Bearer " + session.accessToken : "",
  },
  body: noJson ? data : JSON.stringify(data),
});

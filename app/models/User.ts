import i18n from "../i18n/i18n";
import { formatAmount } from "../utils/Utils";
import { Blockchain } from "./Blockchain";
import { HistoryType } from "./HistoryType";
import { Language } from "./Language";

export enum UserRole {
  Unknown = "Unknown",
  User = "User",
  Admin = "Admin",
  EMPLOYEE = "Employee",
  VIP = "VIP",
  BETA = "Beta",
}

export enum UserStatus {
  NA = "NA",
  ACTIVE = "Active",
}

export enum KycStatus {
  NA = "NA",
  CHATBOT = "Chatbot",
  ONLINE_ID = "OnlineId",
  VIDEO_ID = "VideoId",
  CHECK = "Check",
  COMPLETED = "Completed",
  REJECTED = "Rejected",
}

export enum KycState {
  NA = "NA",
  FAILED = "Failed",
  REMINDED = "Reminded",
  REVIEW = "Review",
}

export enum AccountType {
  PERSONAL = "Personal",
  BUSINESS = "Business",
  SOLE_PROPRIETORSHIP = "SoleProprietorship",
}

export enum TradingPeriod {
  DAY = "Day",
  YEAR = "Year",
}

export interface KycInfo {
  kycStatus: KycStatus;
  kycState: KycState;
  kycDataComplete: boolean;
  kycHash: string;
  accountType: AccountType;
  tradingLimit: { limit: number; period: TradingPeriod };
  sessionUrl?: string;
  setupUrl?: string;
  blankedPhone?: string;
  blankedMail?: string;
}

export interface NewUser {
  address: string;
  signature: string;
  walletId: number;
  usedRef: string | undefined | null;
}

export interface Fees {
  buy: number;
  sell: number;
}

export interface UserDto {
  accountType: AccountType;
  address: string;
  mail: string | null;
  phone: string;
  language: Language;
  status: UserStatus;

  kycHash: string;
  kycStatus: KycStatus;
  kycState: KycState;
  kycDataComplete: boolean;
  tradingLimit: { limit: number; period: TradingPeriod };

  apiKeyCT: string;
  apiFilterCT: HistoryType[];
}

export interface User {
  accountType: AccountType;
  address: string;
  mail: string;
  phone: string;
  language: Language;
  status: UserStatus;

  kycHash: string;
  kycStatus: KycStatus;
  kycState: KycState;
  kycDataComplete: boolean;
  tradingLimit: { limit: number; period: TradingPeriod };

  apiKeyCT: string;
  apiFilterCT: HistoryType[];
}

export interface UserDetailDto extends UserDto {
  ref?: string;
  refFeePercent?: number;
  refVolume: number;
  refCredit: number;
  paidRefCredit: number;
  refCount: number;
  refCountActive: number;
  buyVolume: VolumeInformation;
  sellVolume: VolumeInformation;
  cryptoVolume: VolumeInformation;

  linkedAddresses: LinkedAddress[];
}

export interface UserDetail extends User {
  ref?: string;
  refFeePercent?: number;
  refVolume: number;
  refCredit: number;
  paidRefCredit: number;
  refCount: number;
  refCountActive: number;
  buyVolume: VolumeInformation;
  sellVolume: VolumeInformation;
  cryptoVolume: VolumeInformation;

  linkedAddresses: LinkedAddress[];
}

export interface VolumeInformation {
  total: number;
  annual: number;
}

export interface LinkedAddress {
  address: string;
  blockchains: Blockchain[];
  isSwitchable: boolean;
}

export const fromUserDto = (user: UserDto): User => ({
  accountType: user.accountType,
  address: user.address,
  mail: user.mail ?? "",
  phone: user.phone,
  language: user.language,
  status: user.status,

  kycStatus: user.kycStatus,
  kycState: user.kycState,
  kycHash: user.kycHash,
  tradingLimit: user.tradingLimit,
  kycDataComplete: user.kycDataComplete,

  apiKeyCT: user.apiKeyCT,
  apiFilterCT: user.apiFilterCT,
});

export const toUserDto = (user: User): UserDto => ({
  accountType: user.accountType,
  address: user.address,

  mail: toStringDto(user.mail),
  phone: user.phone,
  language: user.language,
  status: user.status,

  kycStatus: user.kycStatus,
  kycState: user.kycState,
  kycHash: user.kycHash,
  tradingLimit: user.tradingLimit,
  kycDataComplete: user.kycDataComplete,

  apiKeyCT: user.apiKeyCT,
  apiFilterCT: user.apiFilterCT,
});

export const fromUserDetailDto = (dto: UserDetailDto): UserDetail => ({
  ...fromUserDto(dto),
  ref: dto.ref,
  refFeePercent: dto.refFeePercent,
  refVolume: dto.refVolume,
  refCredit: dto.refCredit,
  paidRefCredit: dto.paidRefCredit,
  refCount: dto.refCount,
  refCountActive: dto.refCountActive,
  buyVolume: dto.buyVolume,
  sellVolume: dto.sellVolume,
  cryptoVolume: dto.cryptoVolume,

  linkedAddresses: dto.linkedAddresses,
});

const toStringDto = (string: string): string | null => (string === "" ? null : string);

export const kycNotStarted = (kycStatus?: KycStatus) => [KycStatus.NA].includes(kycStatus ?? KycStatus.NA);

export const kycCompleted = (kycStatus?: KycStatus) => [KycStatus.COMPLETED].includes(kycStatus ?? KycStatus.NA);

export const kycInProgress = (kycStatus?: KycStatus) =>
  [KycStatus.CHATBOT, KycStatus.ONLINE_ID, KycStatus.VIDEO_ID].includes(kycStatus ?? KycStatus.NA);

export const getKycStatusString = (user: User | KycInfo): string => {
  if (kycInProgress(user.kycStatus)) {
    return `${i18n.t("model.kyc." + user.kycState.toLowerCase())} (${i18n.t(
      "model.kyc." + user.kycStatus.toLowerCase()
    )})`;
  } else {
    return i18n.t(`model.kyc.${user.kycStatus.toLowerCase()}`);
  }
};

export const getTradeLimit = (user: User | KycInfo): string => {
  return user.tradingLimit
    ? `${formatAmount(user.tradingLimit.limit)} € ${i18n.t("model.user.per_" + user.tradingLimit.period.toLowerCase())}`
    : "";
};

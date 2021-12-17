import { BuyRoute, BuyRouteDto, fromBuyRouteDto } from "./BuyRoute";
import { Country } from "./Country";
import { Language } from "./Language";
import { fromSellRouteDto, SellRoute, SellRouteDto } from "./SellRoute";

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
  VERIFY = "Verified",
}

export enum KycStatus {
  NA = "NA",
  WAIT_CHAT_BOT = "Chatbot",
  WAIT_VERIFY_ADDRESS = "Address",
  WAIT_VERIFY_ONLINE = "OnlineId",
  WAIT_VERIFY_VIDEO = "VideoId",
  WAIT_VERIFY_MANUAL = "Manual",
  COMPLETED = "Completed",
}

export enum KycState {
  NA = "NA",
  FAILED = "Failed",
  REMINDED = "Reminded",
}

export interface NewUserDto {
  address: string;
  signature: string;
  wallet: number;
  usedRef: string | undefined | null;
}

export interface NewUser {
  address: string;
  signature: string;
  walletId: number;
  usedRef: string | undefined | null;
}

export interface RefData {
  ref: string;
  refFee: number;
  refCount: number;
  refCountActive: number;
  refVolume: number;
}

export interface UserVolume {
  buyVolume: number;
  sellVolume: number;
}

export const toNewUserDto = (user: NewUser): NewUserDto => ({
  address: user.address,
  signature: user.signature,
  wallet: user.walletId,
  usedRef: user.usedRef === "" ? null : user.usedRef,
});

export interface UserDto extends NewUserDto {
  firstname: string;
  surname: string;
  street: string;
  houseNumber: string;
  zip: string;
  location: string;
  country: Country;
  mail: string | null;
  phone: string;

  usedRef: string | null;
  refData: RefData;
  userVolume: UserVolume;
  status: UserStatus;
  kycStatus: KycStatus;
  kycState: KycState;
  depositLimit: number;
  language: Language;
  ip: string;
}

export interface User extends NewUser {
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  zip: string;
  location: string;
  country: Country;
  mail: string;
  mobileNumber: string;

  usedRef: string;
  refData: RefData;
  userVolume: UserVolume;
  status: UserStatus;
  kycStatus: KycStatus;
  kycState: KycState;
  depositLimit: number;
  language: Language;
  ip: string;
}

export interface UserDetailDto extends UserDto {
  buys: BuyRouteDto[];
  sells: SellRouteDto[];
}

export interface UserDetail extends User {
  buys: BuyRoute[];
  sells: SellRoute[];
}

export const fromUserDto = (user: UserDto): User => ({
  address: user.address,
  signature: user.signature,
  firstName: user.firstname,
  lastName: user.surname,
  street: user.street,
  houseNumber: user.houseNumber,
  zip: user.zip,
  location: user.location,
  country: user.country,
  mail: user.mail ?? "",
  mobileNumber: user.phone,
  usedRef: user.usedRef ?? "",
  refData: user.refData,
  userVolume: user.userVolume,
  walletId: user.wallet,
  status: user.status,
  kycStatus: user.kycStatus,
  kycState: user.kycState,
  depositLimit: user.depositLimit,
  language: user.language,
  ip: user.ip,
});

export const toUserDto = (user: User): UserDto => ({
  address: user.address,
  signature: user.signature,
  firstname: user.firstName,
  surname: user.lastName,
  street: user.street,
  houseNumber: user.houseNumber,
  zip: user.zip,
  location: user.location,
  country: user.country,
  mail: toStringDto(user.mail),
  phone: user.mobileNumber,
  usedRef: toStringDto(user.usedRef),
  refData: user.refData,
  userVolume: user.userVolume,
  wallet: user.walletId,
  status: user.status,
  kycStatus: user.kycStatus,
  kycState: user.kycState,
  depositLimit: user.depositLimit,
  language: user.language,
  ip: user.ip,
});

export const fromUserDetailDto = (dto: UserDetailDto): UserDetail => ({
  ...fromUserDto(dto),
  buys: dto.buys.map((buy) => fromBuyRouteDto(buy)),
  sells: dto.sells.map((sell) => fromSellRouteDto(sell)),
});

const toStringDto = (string: string): string | null =>
  string === "" ? null : string;

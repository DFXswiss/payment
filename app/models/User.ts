import { Country } from "./Country";
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
  MANUAL = "Manual",
  COMPLETED = "Completed",
}

export enum KycState {
  NA = "NA",
  FAILED = "Failed",
  REMINDED = "Reminded",
}

export enum AccountType {
  PERSONAL = "Personal",
  BUSINESS = "Business",
  SOLE_PROPRIETORSHIP = "SoleProprietorship",
}

export enum CfpVote {
  YES = "Yes",
  NO = "No",
  NEUTRAL = "Neutral",
}

export interface KycResult {
  status: KycStatus;
  identUrl?: string;
  setupUrl?: string;
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

export interface Fees {
  buy: number;
  refBonus: number;
  sell: number;
}

export interface CfpVotes {
  [number: number]: CfpVote;
}

export const toNewUserDto = (user: NewUser): NewUserDto => ({
  address: user.address,
  signature: user.signature,
  wallet: user.walletId,
  usedRef: user.usedRef === "" ? null : user.usedRef,
});

export interface UserDto extends NewUserDto {
  accountType: AccountType;
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
  status: UserStatus;
  kycStatus: KycStatus;
  kycState: KycState;
  kycHash: string;
  depositLimit: number;
  language: Language;
  ip: string;

  refVolume: number;
  refCredit: number;

  organizationName: string;
  organizationStreet: string;
  organizationHouseNumber: string;
  organizationLocation: string;
  organizationZip: string;
  organizationCountry: Country;

  cfpVotes: CfpVotes;
}

export interface User extends NewUser {
  accountType: AccountType;
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
  status: UserStatus;
  kycStatus: KycStatus;
  kycState: KycState;
  kycHash: string;
  depositLimit: number;
  language: Language;
  ip: string;

  refVolume: number;
  refCredit: number;

  organizationName: string;
  organizationStreet: string;
  organizationHouseNumber: string;
  organizationLocation: string;
  organizationZip: string;
  organizationCountry: Country;

  cfpVotes: CfpVotes;
}

export interface UserDetailDto extends UserDto {
  refData: RefData;
}

export interface UserDetail extends User {
  refData: RefData;
}

export const fromUserDto = (user: UserDto): User => ({
  accountType: user.accountType,
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
  walletId: user.wallet,
  status: user.status,
  kycStatus: user.kycStatus,
  kycState: user.kycState,
  kycHash: user.kycHash,
  depositLimit: user.depositLimit,
  language: user.language,
  ip: user.ip,
  refVolume: user.refVolume,
  refCredit: user.refCredit,
  organizationName: user.organizationName,
  organizationStreet: user.organizationStreet,
  organizationHouseNumber: user.organizationHouseNumber,
  organizationLocation: user.organizationLocation,
  organizationZip: user.organizationZip,
  organizationCountry: user.organizationCountry,
  cfpVotes: user.cfpVotes,
});

export const toUserDto = (user: User): UserDto => ({
  accountType: user.accountType,
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
  wallet: user.walletId,
  status: user.status,
  kycStatus: user.kycStatus,
  kycState: user.kycState,
  kycHash: user.kycHash,
  depositLimit: user.depositLimit,
  language: user.language,
  ip: user.ip,
  refVolume: user.refVolume,
  refCredit: user.refCredit,
  organizationName: user.organizationName,
  organizationStreet: user.organizationStreet,
  organizationHouseNumber: user.organizationHouseNumber,
  organizationLocation: user.organizationLocation,
  organizationZip: user.organizationZip,
  organizationCountry: user.organizationCountry,
  cfpVotes: user.cfpVotes,
});

export const fromUserDetailDto = (dto: UserDetailDto): UserDetail => ({
  ...fromUserDto(dto),
  refData: dto.refData,
});

const toStringDto = (string: string): string | null => (string === "" ? null : string);

export const kycCompleted = (kycStatus?: KycStatus) =>
  [KycStatus.MANUAL, KycStatus.COMPLETED].includes(kycStatus ?? KycStatus.NA);

export const kycInProgress = (kycStatus?: KycStatus) =>
  [KycStatus.CHATBOT, KycStatus.ONLINE_ID, KycStatus.VIDEO_ID].includes(kycStatus ?? KycStatus.NA);

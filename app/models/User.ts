import { Country } from "./Country";
import { Language } from "./Language";
// TODO: birthday, staatsangehörigkeit, language, email-settings, KYC status, gebühr

export enum UserRole {
  Unknown = "Unknown",
  User = "User",
  Admin = "Admin",
  EMPLOYEE = "Employee",
  VIP = "VIP",
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
  WAIT_VERIFY_ID = "Address",
  WAIT_VERIFY_MANUAL = "Manual",
  COMPLETED = "Completed",
}

export interface NewUserDto {
  address: string;
  signature: string;
  walletId: number;
  usedRef: string;
}

export interface NewUser {
  address: string;
  signature: string;
  walletId: number;
  usedRef: string;
}

export interface RefData {
  ref: string;
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
  walletId: user.walletId,
  usedRef: user.usedRef,
});

export interface UserDto extends NewUserDto {
  firstname: string;
  surname: string;
  street: string;
  houseNumber: string;
  zip: string;
  location: string;
  country: Country;
  mail: string;
  phone: string;

  usedRef: string;
  refData: RefData;
  userVolume: UserVolume;
  status: UserStatus;
  kycStatus: KycStatus;
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
  language: Language;
  ip: string;
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
  mail: user.mail,
  mobileNumber: user.phone,
  usedRef: user.usedRef,
  refData: user.refData,
  userVolume: user.userVolume,
  walletId: user.walletId,
  status: user.status,
  kycStatus: user.kycStatus,
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
  mail: user.mail,
  phone: user.mobileNumber,
  usedRef: user.usedRef,
  refData: user.refData,
  userVolume: user.userVolume,
  walletId: user.walletId,
  status: user.status,
  kycStatus: user.kycStatus,
  language: user.language,
  ip: user.ip,
});

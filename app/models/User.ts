export interface NewUserDto {
  address: string;
  signature: string;
  wallet_id: number;
}

export interface NewUser {
  address: string;
  signature: string;
  walletId: number;
}

export const toNewUserDto = (user: NewUser): NewUserDto => ({
  address: user.address,
  signature: user.signature,
  wallet_id: user.walletId
})

export interface UserDto extends NewUserDto {
  firstname: string;
  surname: string;
  street: string;
  zip: string;
  location: string;
  mail: string;
  phone_number: string;

  ref: string;
  used_ref: string;

  created: string;
  IP: string;
}

export interface User extends NewUser {
  firstName: string;
  lastName: string;
  street: string;
  zip: string;
  location: string;
  mail: string;
  phoneNumber: string;

  ref: string;
  usedRef: string;

  created: Date;
  ip: string;
}

export const fromUserDto = (user: UserDto): User => ({
  address: user.address,
  signature: user.signature,
  firstName: user.firstname,
  lastName: user.surname,
  street: user.street,
  zip: user.zip,
  location: user.location,
  mail: user.mail,
  phoneNumber: user.phone_number,
  ref: user.ref,
  usedRef: user.used_ref,
  walletId: user.wallet_id,
  created: new Date(user.created),
  ip: user.IP,
});

export const toUserDto = (user: User): UserDto => ({
  address: user.address,
  signature: user.signature,
  firstname: user.firstName,
  surname: user.lastName,
  street: user.street,
  zip: user.zip,
  location: user.location,
  mail: user.mail,
  phone_number: user.phoneNumber,
  ref: user.ref,
  used_ref: user.usedRef,
  wallet_id: user.walletId,
  created: user.created.toString(),
  IP: user.ip,
});

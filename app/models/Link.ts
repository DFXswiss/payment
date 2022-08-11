export interface LinkDto {
  existing: AddressInformationDto;
  linkTo: AddressInformationDto;
}

interface AddressInformationDto {
  address: string;
  signature: string;
}

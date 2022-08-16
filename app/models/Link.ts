export interface LinkAddressDto {
  authentication: string;
  existingAddress: string;
  newAddress: string;
  isCompleted: boolean;
  expiration: Date;
}

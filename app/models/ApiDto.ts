export interface ApiError {
  error: string;
  statusCode: number;
  message: string;
}

export interface AuthResponse {
  accessToken: string;
}

export enum UserRole {
  Unknown = "Unknown",
  User = "User",
  Admin = "Admin"
}
export interface ApiError {
  error: string;
  statusCode: number;
  message: string;
}

export interface AuthResponse {
  accessToken: string;
}
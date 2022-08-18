import { Blockchain } from "./Blockchain";

export interface ApiError {
  statusCode: number;
  message: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface ApiSignMessage {
  message: string;
  blockchain: Blockchain;
}

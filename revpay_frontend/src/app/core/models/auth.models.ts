export interface RegisterPersonalRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterBusinessRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  businessRegistrationNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;           // backend field name is "token"
  refreshToken?: string;
  role: Role;
  email: string;
  fullName: string;
  accountId: number;       // backend field name is "accountId"
}

export interface AuthUser {
  email: string;
  fullName: string;
  role: Role;
  primaryAccountId: number;
}

export type Role = 'PERSONAL' | 'BUSINESS' | 'ADMIN';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
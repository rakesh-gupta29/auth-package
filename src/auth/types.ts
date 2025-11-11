export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface UserCredits {
  available: number;
  total: number;
  used: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenResponse {
  token: string;
  user: User;
}

export interface GoogleSSOData {
  idToken: string;
}

export interface CheckEmailResponse {
  exists: boolean;
  email: string;
}

export interface AuthConfig {
  apiBaseUrl: string;
  tokenKey?: string;
  refreshTokenKey?: string;
}

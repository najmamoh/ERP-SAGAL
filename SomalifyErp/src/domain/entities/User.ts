/**
 * Domain Entity: User
 * Represents the core user business entity
 */
export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'user' | 'admin' | 'superAdmin';
  company_id: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration {
  full_name: string;
  email: string;
  password: string;
  role: string;
  company_id: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: string;
}

export interface UserSession extends User, AuthTokens {
  loginTimestamp: number;
}

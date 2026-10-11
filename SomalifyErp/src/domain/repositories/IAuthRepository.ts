/**
 * Repository Interface: Authentication
 * Defines the contract for authentication operations
 */
import { UserCredentials, UserRegistration, UserSession, AuthTokens } from '../entities/User';

export interface IAuthRepository {
  login(credentials: UserCredentials): Promise<UserSession>;
  register(data: UserRegistration): Promise<UserSession>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserSession>;
}

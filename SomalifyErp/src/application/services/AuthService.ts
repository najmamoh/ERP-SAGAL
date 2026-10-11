/**
 * Application Service: Authentication
 * Contains business logic for authentication operations
 */
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { UserCredentials, UserRegistration, UserSession, AuthTokens } from '../../domain/entities/User';

export class AuthService {
  constructor(private repository: IAuthRepository) {}

  async login(credentials: UserCredentials): Promise<UserSession> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    return await this.repository.login(credentials);
  }

  async register(data: UserRegistration): Promise<UserSession> {
    if (!data.email || !data.password || !data.full_name) {
      throw new Error('Email, password, and full name are required');
    }
    return await this.repository.register(data);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    return await this.repository.refreshToken(refreshToken);
  }

  async logout(): Promise<void> {
    await this.repository.logout();
  }

  async getCurrentUser(): Promise<UserSession> {
    return await this.repository.getCurrentUser();
  }
}

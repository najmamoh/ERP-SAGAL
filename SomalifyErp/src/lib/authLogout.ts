/**
 * Central logout: calls backend endpoints to clear httpOnly cookies server-side,
 * then wipes all client-side auth state.
 *
 * IMPORTANT: Uses a plain axios instance (no interceptors) so that if the
 * backend returns 401/403, the global response interceptor does NOT fire
 * a competing redirect to SignIn/AdminSignIn.
 */
import axios from 'axios';
import { Url } from '@/Interfaces';
import { clearAuthCookies } from './cookies';
import { markLoggingOut, clearLoggingOut } from '@/axiosGlobal';

// Plain axios instance — no request/response interceptors.
const logoutClient = axios.create({ withCredentials: true });

export async function performLogout(): Promise<void> {
  // Tell the global interceptor to stop trying to refresh / redirect
  markLoggingOut();

  let refreshToken: string | undefined;
  let mainRefreshToken: string | undefined;

  try {
    const raw = localStorage.getItem('userInfo');
    const parsed = raw ? JSON.parse(raw) : {};
    refreshToken = parsed.refreshToken;
    mainRefreshToken = parsed.mainRefreshToken;
  } catch {
    // ignore parse errors
  }

  // Call both backend endpoints using logoutClient (no interceptors).
  await Promise.allSettled([
    logoutClient.post(`${Url}/auth/logout`, { refreshToken }).catch(() => {}),
    logoutClient.post(`${Url}/main/auth/logout`, {
      refreshToken: mainRefreshToken ?? refreshToken,
      mainRefreshToken,
    }).catch(() => {}),
  ]);

  // Wipe all client-side auth state
  clearAuthCookies();
  localStorage.removeItem('userInfo');
  sessionStorage.clear();
  delete axios.defaults.headers.common['Authorization'];

  clearLoggingOut();
}

/**
 * Detects whether the current session belongs to a main admin.
 * Call BEFORE performLogout() so you know where to redirect.
 */
export function detectIsMainAdmin(): boolean {
  try {
    const raw = localStorage.getItem('userInfo');
    const parsed = raw ? JSON.parse(raw) : {};
    const roles: string[] = parsed?.user?.roles ?? parsed?.roles ?? [];
    return (
      Boolean(parsed.mainAccessToken) ||
      roles.includes('admin') ||
      roles.includes('superAdmin') ||
      roles.includes('super_admin')
    );
  } catch {
    return false;
  }
}

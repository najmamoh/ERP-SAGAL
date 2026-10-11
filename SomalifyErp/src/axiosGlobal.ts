/**
 * Global axios interceptor for the default axios instance (used by Redux slices).
 * On 401: refresh the token (using a bare axios instance to avoid interceptor loops),
 *         then retry the failed request.
 * On 403: show access denied toast.
 *
 * KEY FIX: refresh calls use `refreshClient` (no interceptors) so a failing refresh
 * does NOT re-enter this interceptor, which previously caused an infinite deadlock
 * that kept isRefreshing=true forever and left all requests stuck loading.
 */
import axios from "axios";
import { Url } from "./Interfaces";
import { performLogout } from "./lib/authLogout";

const ACCESS_DENIED_MSG = "You don't have access. Fadlan lama ogola!";

// Plain axios instance with NO interceptors — used only for token refresh
// so those requests never trigger the 401 retry loop on themselves.
const refreshClient = axios.create({ withCredentials: true });

// When true, the interceptor skips refresh attempts and just rejects.
// Set by performLogout → markLoggingOut so a deliberate logout
// doesn't race with interceptor-driven redirects.
let _loggingOut = false;
export function markLoggingOut() { _loggingOut = true; }
export function clearLoggingOut() { _loggingOut = false; }

let isRefreshing = false;
type Resolve = (value?: unknown) => void;
type Reject = (reason?: unknown) => void;
const failedQueue: Array<{ resolve: Resolve; reject: Reject }> = [];

function fullRequestUrl(config: any): string {
  const base = String(config?.baseURL ?? '');
  const url = String(config?.url ?? '');
  // If url is already absolute, keep it; else join with baseURL if present.
  if (/^https?:\/\//i.test(url)) return url;
  if (!base) return url;
  return `${base.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
}

function isAuthEndpoint(config: any): boolean {
  const u = fullRequestUrl(config);
  return (
    u.includes('/auth/signin') ||
    u.includes('/main/auth/signin') ||
    u.includes('/auth/refresh-token') ||
    u.includes('/main/auth/refresh-token') ||
    u.includes('/auth/logout') ||
    u.includes('/main/auth/logout')
  );
}

function flushQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue.length = 0;
}

function isMainDashboard(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/AdminDashboard")) return true;
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const roles = userInfo.user?.roles || userInfo.roles || [];
    return (
      roles.includes("admin") ||
      roles.includes("superAdmin") ||
      roles.includes("super_admin") ||
      Boolean(userInfo.mainAccessToken)
    );
  } catch {
    return false;
  }
}

function redirectToLogin() {
  performLogout().then(() => {
    // One unified fallback route after auth expiry.
    window.location.replace("/");
  });
}

async function doRefresh(isMain: boolean): Promise<string> {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const refreshToken = userInfo.refreshToken || userInfo.mainRefreshToken;
  if (!refreshToken) throw new Error("No refresh token available");

  const endpoint = isMain
    ? `${Url}/main/auth/refresh-token`
    : `${Url}/auth/refresh-token`;

  // Use refreshClient (no interceptors) to avoid recursive 401 handling
  const res = await refreshClient.post(endpoint, { refreshToken });

  const newAccessToken: string = res.data.accessToken ?? (isMain ? userInfo.mainAccessToken : userInfo.accessToken);

  const updated = {
    ...userInfo,
    refreshToken: res.data.refreshToken ?? refreshToken,
    refreshTokenExpiry: res.data.refreshTokenExpiry ?? userInfo.refreshTokenExpiry,
    accessTokenExpiry: res.data.accessTokenExpiry ?? userInfo.accessTokenExpiry,
  };
  if (isMain) {
    updated.mainAccessToken = newAccessToken;
  } else {
    updated.accessToken = newAccessToken;
  }
  localStorage.setItem("userInfo", JSON.stringify(updated));

  // Keep the default axios header in sync
  axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

  return newAccessToken;
}

function setupGlobalAxiosInterceptor() {
  // ── Request interceptor: inject access token from localStorage ──────────────
  axios.interceptors.request.use(
    (config) => {
      try {
        // Never attach Authorization to auth endpoints (signin/refresh/logout).
        if (isAuthEndpoint(config)) {
          return config;
        }
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const isMain = isMainDashboard();
        const token = isMain ? userInfo.mainAccessToken : userInfo.accessToken;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Ignore localStorage read errors
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response interceptor: handle 401 (token refresh) and 403 (denied) ──────
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      // const originalUrl = fullRequestUrl(originalRequest);

      // 403 – permission denied, surface a friendly bilingual message
      if (error.response?.status === 403) {
        if (error.response?.data && typeof error.response.data === "object") {
          error.response.data.message = ACCESS_DENIED_MSG;
        }
        return Promise.reject(error);
      }

      // Never try refresh flow for auth endpoints. A 401 on /signin means "bad credentials".
      if (isAuthEndpoint(originalRequest)) {
        return Promise.reject(error);
      }

      // Pass through everything that isn't a 401, or requests already retried,
      // or if a deliberate logout is in progress (don't try to refresh / redirect).
      if (error.response?.status !== 401 || originalRequest._retry || _loggingOut) {
        return Promise.reject(error);
      }

      // If a refresh is already in flight, queue this request and wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          originalRequest._retry = true;
          return axios(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      // First 401 — start refresh
      originalRequest._retry = true;
      isRefreshing = true;
      const isMain = isMainDashboard();

      try {
        const newToken = await doRefresh(isMain);
        // Inject fresh token into the original failing request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        // Let all queued requests proceed with the new token
        flushQueue(null, newToken);
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed — reject every queued request and log out
        flushQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}

setupGlobalAxiosInterceptor();

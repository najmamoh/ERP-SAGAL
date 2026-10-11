/**
 * Cookie helpers for auth (login/logout).
 */

export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
};

const expiry = "expires=Thu, 01 Jan 1970 00:00:00 UTC";

export const removeCookie = (name: string, path: string = "/") => {
  document.cookie = `${name}=; ${expiry} path=${path};`;
};

/** Clear all auth-related cookies (company + main) so logout removes everything. */
export const clearAuthCookies = () => {
  removeCookie("userInfo");
  removeCookie("authToken");
  removeCookie("refreshToken");
  removeCookie("refreshToken", "/api/auth/refresh-token");
  removeCookie("mainAccessToken");
  removeCookie("mainRefreshToken");
  removeCookie("token");
};

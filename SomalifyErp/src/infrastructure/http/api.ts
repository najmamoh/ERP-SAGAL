/**
 * Infrastructure: HTTP API Client
 * Axios instance with interceptors for authentication
 */
import axios, { AxiosInstance } from 'axios';
import { store } from '../../Redux/Store';
import { logout, setUser } from '../../Redux/Slice/userinfo';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL,
});

let isRefreshing = false;
let failedRequests: Array<(token: string) => void> = [];
let refreshTimeout: NodeJS.Timeout | null = null;

export const clearRefreshTimeout = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
};

const scheduleTokenRefresh = () => {
  clearRefreshTimeout();
  
  refreshTimeout = setTimeout(async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo.refreshToken) return;

    try {
      await handleTokenRefresh();
      scheduleTokenRefresh();
    } catch (error) {
      console.error('Proactive refresh failed:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        store.dispatch(logout());
      }
    }
  }, 3600000); // 1 hour
};

const handleTokenRefresh = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      failedRequests.push((newToken: string) => resolve(newToken));
    });
  }

  isRefreshing = true;
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  try {
    const roles = userInfo.user?.roles || userInfo.roles || [];
    const isAdmin = roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin');
    const refreshEndpoint = isAdmin 
      ? `${baseURL}/main/auth/refresh-token`
      : `${baseURL}/auth/refresh-token`;

    const response = await axios.post(refreshEndpoint, {
      refreshToken: userInfo.refreshToken
    }, {
      headers: isAdmin ? {
        Authorization: `Bearer ${userInfo.refreshToken}`
      } : {}
    });

    const newAccessToken = response.data.accessToken;
    const newRefreshToken = response.data.refreshToken || userInfo.refreshToken;

    const updatedUserInfo = {
      ...userInfo,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiry: response.data.refreshTokenExpiry || userInfo.refreshTokenExpiry
    };

    store.dispatch(setUser(updatedUserInfo));
    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
    
    failedRequests.forEach(cb => cb(newAccessToken));
    failedRequests = [];

    scheduleTokenRefresh();
    return newAccessToken;
  } catch (error) {
    clearRefreshTimeout();
    store.dispatch(logout());
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Request interceptor
api.interceptors.request.use(config => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (userInfo.accessToken) {
    config.headers.Authorization = `Bearer ${userInfo.accessToken}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await handleTokenRefresh();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Initialize auth
const initializeAuth = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (userInfo.accessToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${userInfo.accessToken}`;
    scheduleTokenRefresh();
  }
};

initializeAuth();

export default api;

// import axios from 'axios';
// import { store } from './Redux/Store';
// import { logout } from './Redux/Slice/userinfo';
// import { Url } from './Interfaces';
// // import { logout } from './Redux/Slice/LoginSlice';

// const api = axios.create({ baseURL: Url });

// api.interceptors.request.use(config => {
//   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//   if (userInfo.accessToken) {
//     config.headers.Authorization = `Bearer ${userInfo.accessToken}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const { refreshToken } = JSON.parse(localStorage.getItem('userInfo') || '{}');
//         const { data } = await axios.post(`${Url}/auth/refresh-token`, { refreshToken });
        
//         localStorage.setItem('userInfo', JSON.stringify({
//           ...JSON.parse(localStorage.getItem('userInfo') || '{}'),
//           accessToken: data.accessToken
//         }));
        
//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         store.dispatch(logout());
//         localStorage.removeItem('userInfo');
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;



// Create src/api/axios.ts
// import axios from 'axios';
// import { store } from './Redux/Store';
// import { logout } from './Redux/Slice/userinfo';



// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// });

// let isRefreshing = false;
// let failedRequests: any[] = [];

// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve) => {
//           failedRequests.push(() => resolve(api(originalRequest)));
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;
      
//       try {
//         const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//         const { data } = await api.post('/auth/refresh-token', {
//           refreshToken: userInfo.refreshToken
//         });

//         localStorage.setItem('userInfo', JSON.stringify({
//           ...userInfo,
//           accessToken: data.accessToken,
//           refreshToken: data.refreshToken,
//           refreshTokenExpiry: data.refreshTokenExpiry
//         }));

//         api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
//         failedRequests.forEach(cb => cb());
//         failedRequests = [];
        
//         return api(originalRequest);
//       } catch (refreshError) {
//         store.dispatch(logout());
//         localStorage.removeItem('userInfo');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;





// import axios from 'axios';
// import { store } from './Redux/Store';
// import { logout, setUser } from './Redux/Slice/userinfo'; // Add setUser import
// import { Url } from './Interfaces';

// const baseURL = import.meta.env.VITE_API_URL;

// const api = axios.create({
//   baseURL,
// });

// let isRefreshing = false;
// let failedRequests: Array<(token: string) => void> = [];
// let refreshTimeout: NodeJS.Timeout | null = null;

// // Helper function for token expiration
// const getTokenExpiration = (token: string): number => {
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return payload.exp * 1000;
//   } catch {
//     return 0;
//   }
// };

// // Export a function to clear the timeout
// export const clearRefreshTimeout = () => {
//   if (refreshTimeout) {
//     clearTimeout(refreshTimeout);
//     refreshTimeout = null;
//   }
// };

// const scheduleTokenRefresh = () => {
//   clearRefreshTimeout();
  
//   refreshTimeout = setTimeout(async () => {
//     const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//     if (!userInfo.refreshToken) return;

//     try {
//       await handleTokenRefresh();
//       scheduleTokenRefresh();
//     } catch (error) {
//       console.error('Proactive refresh failed:', error);
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//         store.dispatch(logout());
//       }
//     }
//   }, 300000);
// };

// const handleTokenRefresh = async (): Promise<string> => {
//   if (isRefreshing) {
//     return new Promise((resolve) => {
//       failedRequests.push((newToken: string) => resolve(newToken));
//     });
//   }

//   isRefreshing = true;
//   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

//   try {
//     const response = await axios.post(`${Url}/auth/refresh-token`, {
//       refreshToken: userInfo.refreshToken
//     });

//     const newAccessToken = response.data.accessToken;
//     const newRefreshToken = response.data.refreshToken;

//     store.dispatch(setUser({
//       full_name: userInfo.full_name,
//       accessToken: newAccessToken,
//       refreshToken: newRefreshToken,
//       refreshTokenExpiry: response.data.refreshTokenExpiry
//     }));

//     api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
    
//     failedRequests.forEach(cb => cb(newAccessToken));
//     failedRequests = [];

//     scheduleTokenRefresh();
//     return newAccessToken;
//   } catch (error) {
//     clearRefreshTimeout();
//     store.dispatch(logout());
//     if (axios.isAxiosError(error)) {
//       console.error('Refresh error:', error.response?.data);
//     }
//     throw error;
//   } finally {
//     isRefreshing = false;
//   }
// };

// // Request interceptor
// api.interceptors.request.use(config => {
//   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//   if (userInfo.accessToken) {
//     config.headers.Authorization = `Bearer ${userInfo.accessToken}`;
//   }
//   return config;
// });

// // Response interceptor
// api.interceptors.request.use(config => {
//   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//   if (userInfo.token) { // Now using 'token' field for access token
//     config.headers.Authorization = `Bearer ${userInfo.token}`;
//   }
//   return config;
// });

// // Initialize auth
// const initializeAuth = () => {
//   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//   if (userInfo.accessToken) {
//     api.defaults.headers.common['Authorization'] = `Bearer ${userInfo.accessToken}`;
//     scheduleTokenRefresh();
//   }
// };

// initializeAuth();

// export default api;









// api.ts
import axios from 'axios';
import { store } from './Redux/Store';
import { logout, setUser } from './Redux/Slice/userinfo';
import { Url } from './Interfaces';

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: true, // Enable cookies for all requests
});

let isRefreshing = false;
let failedRequests: Array<(token: string) => void> = [];
let refreshTimeout: NodeJS.Timeout | null = null;

// Helper to get token expiration time
// const getTokenExpiration = (token: string): number => {
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return payload.exp * 1000;
//   } catch {
//     return 0;
//   }
// };

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
      scheduleTokenRefresh(); // Schedule next refresh
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
    // Check if user is admin/superAdmin to use the correct refresh endpoint
    const roles = userInfo.user?.roles || userInfo.roles || [];
    const isAdmin = roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin');
    const refreshEndpoint = isAdmin 
      ? `${Url}/main/auth/refresh-token`
      : `${Url}/auth/refresh-token`;

    const response = await axios.post(refreshEndpoint, {
      refreshToken: userInfo.refreshToken
    }, {
      withCredentials: true // Send cookies
    });

    const newRefreshToken = response.data.refreshToken || userInfo.refreshToken;

    // Preserve existing user info and update refresh token (access token is in cookie now)
    const updatedUserInfo = {
      ...userInfo,
      refreshToken: newRefreshToken,
      refreshTokenExpiry: response.data.refreshTokenExpiry || userInfo.refreshTokenExpiry
    };

    store.dispatch(setUser(updatedUserInfo));
    
    failedRequests.forEach(cb => cb('')); // Token is in cookie, no need to pass it
    failedRequests = [];

    scheduleTokenRefresh();
    return ''; // Token is in cookie, return empty string
  } catch (error) {
    clearRefreshTimeout();
    store.dispatch(logout());
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Request interceptor - cookies are sent automatically with withCredentials: true
api.interceptors.request.use(config => {
  // Ensure withCredentials is set for all requests
  config.withCredentials = true;
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await handleTokenRefresh();
        // Token is now in cookie, no need to set Authorization header
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Initialize auth - cookies are handled automatically
const initializeAuth = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (userInfo.refreshToken) {
    scheduleTokenRefresh();
  }
};

initializeAuth();

export default api;
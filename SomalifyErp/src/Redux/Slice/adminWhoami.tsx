// adminWhoamiSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Url, errorMsg } from "../../Interfaces";

// Define the admin user data interface
export interface AdminUserData {
  id: number;
  full_name: string;
  email: string;
  company_id?: string;
  roles: string[];
  permissions: string[];
}

// Define the state interface
interface AdminWhoamiState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  userData: AdminUserData | null;
}

const initialState: AdminWhoamiState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  userData: null,
};

export const fetchAdminUser = createAsyncThunk(
  'admin/whoami',
  async (_, { rejectWithValue }) => {
    try {
      // First attempt to fetch admin user data (cookies sent automatically)
      const res = await axios.get(
        `${Url}/main/auth/whoami`,
        {
          withCredentials: true // Cookies sent automatically
        }
      );
      
      return res.data;
    } catch (error) {
      // Handle 401 Unauthorized error (token expired - try refresh)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          // Try to get refresh token from cookies first, then localStorage
          const refreshToken = userInfo.refreshToken || userInfo.mainRefreshToken;

          if (!refreshToken) {
            localStorage.removeItem('userInfo');
            return rejectWithValue('No refresh token found. Please login again.');
          }

          // Attempt to refresh token for main users
          const refreshRes = await axios.post(
            `${Url}/main/auth/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );

          // Update tokens in localStorage (access token is in cookie)
          const updatedUserInfo = {
            ...userInfo,
            mainAccessToken: refreshRes.data.accessToken || userInfo.mainAccessToken,
            refreshToken: refreshRes.data.refreshToken || refreshToken,
            refreshTokenExpiry: refreshRes.data.refreshTokenExpiry || userInfo.refreshTokenExpiry,
            accessTokenExpiry: refreshRes.data.accessTokenExpiry || userInfo.accessTokenExpiry
          };
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          
          // Retry whoami after successful refresh (cookies sent automatically)
          const retryRes = await axios.get(
            `${Url}/main/auth/whoami`,
            {
              withCredentials: true // Cookies sent automatically
            }
          );
          
          return retryRes.data;
        } catch (refreshError) {
          // Handle refresh token failure
          if (axios.isAxiosError(refreshError)) {
            // Clear invalid tokens
            localStorage.removeItem('userInfo');
            // Clear cookies
            document.cookie = 'mainAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'mainRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            return rejectWithValue(refreshError.response?.data?.message || 'Session expired. Please login again.');
          }
          localStorage.removeItem('userInfo');
          document.cookie = 'mainAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'mainRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          return rejectWithValue('Session expired. Please login again.');
        }
      }
      
      // Handle other errors
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data.message || 'Authentication failed');
      }
      return rejectWithValue(errorMsg);
    }
  }
);

const adminWhoamiSlice = createSlice({
  name: 'adminWhoami',
  reducers: {
    resetAdminWhoamiState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.errorMsg = '';
      state.userData = null;
    },
    clearAdminUserData: (state) => {
      state.userData = null;
    }
  },
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.errorMsg = '';
      })
      .addCase(fetchAdminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.errorMsg = '';
        state.userData = action.payload;
      })
      .addCase(fetchAdminUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMsg = String(action.payload) || 'Failed to fetch admin user data';
        state.userData = null;
      });
  }
});

export default adminWhoamiSlice;
export const { resetAdminWhoamiState, clearAdminUserData } = adminWhoamiSlice.actions;

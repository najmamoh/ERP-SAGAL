// whoamiSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { AxiosError } from 'axios';
import axios from "axios";
import { Url, errorMsg } from "../../Interfaces";

// Define the user data interface
export interface CurrentUserData {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  company_id: string | null;
}

// Define the state interface
interface WhoamiState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  userData: CurrentUserData | null;
}

const initialState: WhoamiState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  userData: null,
};

export const fetchCurrentUser = createAsyncThunk(
  'user/whoami',
  async (_, { rejectWithValue }) => {
    try {
      // Global axios interceptor handles:
      // 401 -> refresh token -> retry -> or logout+redirect to "/"
      const res = await axios.get(`${Url}/auth/whoami`, { withCredentials: true });
      return res.data;
    } catch (error) {
      // Handle other errors
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data.message || 'Authentication failed');
      }
      return rejectWithValue(errorMsg);
    }
  }
);

const whoamiSlice = createSlice({
  name: 'whoami',
  reducers: {
    resetWhoamiState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.errorMsg = '';
      state.userData = null;
    },
    clearUserData: (state) => {
      state.userData = null;
    }
  },
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.errorMsg = '';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.errorMsg = '';
        state.userData = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMsg = String(action.payload) || 'Failed to fetch user data';
        state.userData = null;
      });
  }
});

export default whoamiSlice;
export const { resetWhoamiState, clearUserData } = whoamiSlice.actions;
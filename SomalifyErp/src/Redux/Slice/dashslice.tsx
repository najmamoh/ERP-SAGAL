// dashboardSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axios from "axios";
import { Url, errorMsg } from "../../Interfaces";

// Interface xogta dashboard-ka
export interface DashboardData {
  totalUsers: number;
  activeCompanies: number;
  revenue: number;
  recentActivities: string[];
}

// Interface state-ka
interface DashboardState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  data: DashboardData | null;
}

const initialState: DashboardState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: "",
  data: null,
};

// Async thunk: soo qaado xogta dashboard-ka
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      // Hel token-ka user-ka haddii localStorage ku jiro
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) {
        return rejectWithValue("User not authenticated");
      }

     

      const res = await axios.get(`${Url}/dashboard-data`, {
        
        withCredentials: true, // muhiim haddii aad isticmaaleyso cookies
      });

      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data.message || "Failed to fetch dashboard data"
        );
      }
      return rejectWithValue(errorMsg);
    }
  }
);

// Slice-ka dashboard-ka
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboardState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.errorMsg = "";
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.errorMsg = "";
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.errorMsg = "";
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMsg =
          (action.payload as string) || "Failed to fetch dashboard data";
        state.data = null;
      });
  },
});

export default dashboardSlice;
export const { resetDashboardState } = dashboardSlice.actions;

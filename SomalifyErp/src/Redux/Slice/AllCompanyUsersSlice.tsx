import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

interface CompanyUserRow {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  company_id: string;
  create_at?: string;
  updated_at?: string;
  company?: { company_name: string };
  companies?: { company_name: string };
}

interface AllCompanyUsersState {
  data: CompanyUserRow[];
  isLoading: boolean;
  isError: boolean;
  errorMsg: string;
}

const initialState: AllCompanyUsersState = {
  data: [],
  isLoading: false,
  isError: false,
  errorMsg: "",
};

export const getAllCompanyUsersFn = createAsyncThunk(
  "allCompanyUsers/getAll",
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/auth/All`, {
        params: search?.trim() ? { search: search.trim() } : {},
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

const allCompanyUsersSlice = createSlice({
  name: "allCompanyUsers",
  initialState,
  reducers: { resetAllCompanyUsers: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCompanyUsersFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllCompanyUsersFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllCompanyUsersFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetAllCompanyUsers } = allCompanyUsersSlice.actions;
export default allCompanyUsersSlice.reducer;

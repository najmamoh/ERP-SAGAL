import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

interface CompanyUser {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  company_id: string;
  create_at?: string;
  updated_at?: string;
  user_roles?: { id: number; role?: { name: string } }[];
}

interface CompanyUsersState {
  data: CompanyUser[];
  currentUser: CompanyUser | null;
  isLoading: boolean;
  isError: boolean;
  errorMsg: string;
}

const initialState: CompanyUsersState = {
  data: [],
  currentUser: null,
  isLoading: false,
  isError: false,
  errorMsg: "",
};

export const getCompanyUsersFn = createAsyncThunk(
  "companyUsers/getAll",
  async (companyId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/companies/${companyId}/users`, {
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

export const getOneCompanyUserFn = createAsyncThunk(
  "companyUsers/getOne",
  async ({ companyId, userId }: { companyId: string; userId: number }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/companies/${companyId}/users/${userId}`, {
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

const companyUsersSlice = createSlice({
  name: "companyUsers",
  initialState,
  reducers: {
    resetCompanyUsers: () => initialState,
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCompanyUsersFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getCompanyUsersFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getCompanyUsersFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(getOneCompanyUserFn.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      .addCase(getOneCompanyUserFn.rejected, (state) => {
        state.currentUser = null;
      });
  },
});

export const { resetCompanyUsers, setCurrentUser } = companyUsersSlice.actions;
export default companyUsersSlice.reducer;

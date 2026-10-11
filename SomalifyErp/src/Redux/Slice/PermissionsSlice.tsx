import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

interface PermissionsState {
  data: Permission[];
  isLoading: boolean;
  isError: boolean;
  errorMsg: string;
}

const initialState: PermissionsState = {
  data: [],
  isLoading: false,
  isError: false,
  errorMsg: "",
};

export const getAllPermissionsFn = createAsyncThunk(
  "permissions/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/permissions`, {
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

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: { resetPermissions: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPermissionsFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllPermissionsFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllPermissionsFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface RolePermission {
  id: number;
  permission_id: number;
  permission: { id: number; name: string; resource: string; action: string };
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  permissions: RolePermission[];
  _count?: { user_roles: number; main_user_roles: number };
}

interface RolesState {
  data: Role[];
  isLoading: boolean;
  isError: boolean;
  errorMsg: string;
}

const initialState: RolesState = {
  data: [],
  isLoading: false,
  isError: false,
  errorMsg: "",
};

export const getAllRolesFn = createAsyncThunk(
  "roles/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/roles`, {
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

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: { resetRoles: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(getAllRolesFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllRolesFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllRolesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetRoles } = rolesSlice.actions;
export default rolesSlice.reducer;

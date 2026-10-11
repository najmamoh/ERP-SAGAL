import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Url, errorMsg } from "@/Interfaces";

interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  permissions?: Array<{
    permission: {
      id: number;
      name: string;
      description?: string;
    };
  }>;
}

interface RolesManagementState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  data: Role[];
  total: number;
}

const initialState: RolesManagementState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  data: [],
  total: 0,
};

export const getAllRolesFn = createAsyncThunk(
  'roles/getAll',
  async (_, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.get(`${Url}/roles`, {
        withCredentials: true, // This sends the mainAccessToken cookie automatically
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error))
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const createRoleFn = createAsyncThunk(
  'roles/create',
  async (data: { name: string; description: string }, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.post(`${Url}/roles`, data, {
        withCredentials: true, // This sends the mainAccessToken cookie automatically
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error))
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateRoleFn = createAsyncThunk(
  'roles/update',
  async (data: { id: number; name: string; description: string }, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const { id, ...updateData } = data;
      const res = await axios.put(`${Url}/roles/${id}`, updateData, {
        withCredentials: true, // This sends the mainAccessToken cookie automatically
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error))
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteRoleFn = createAsyncThunk(
  'roles/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.delete(`${Url}/roles/${id}`, {
        withCredentials: true, // This sends the mainAccessToken cookie automatically
      });
      return { id, message: res.data.message };
    } catch (error) {
      if (axios.isAxiosError(error))
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

const RolesManagementSlice = createSlice({
  name: 'rolesManagement',
  reducers: {
    resetRolesManagement: () => initialState
  },
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getAllRolesFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getAllRolesFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const roles = Array.isArray(action.payload) ? action.payload : [];
        state.data = roles;
        state.total = roles.length;
      })
      .addCase(getAllRolesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(createRoleFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRoleFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(createRoleFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(updateRoleFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRoleFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(updateRoleFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(deleteRoleFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRoleFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deleteRoleFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  }
});

export const { resetRolesManagement } = RolesManagementSlice.actions;
export default RolesManagementSlice.reducer;

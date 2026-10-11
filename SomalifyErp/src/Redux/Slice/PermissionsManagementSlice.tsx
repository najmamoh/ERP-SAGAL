import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Url, errorMsg } from "@/Interfaces";

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface PermissionsManagementState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  data: Permission[];
  total: number;
}

const initialState: PermissionsManagementState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  data: [],
  total: 0,
};

export const getAllPermissionsFn = createAsyncThunk(
  'permissions/getAll',
  async (_, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.get(`${Url}/permissions`, {
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

export const createPermissionFn = createAsyncThunk(
  'permissions/create',
  async (data: { name: string; resource: string; action: string; description?: string }, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.post(`${Url}/permissions`, data, {
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

export const updatePermissionFn = createAsyncThunk(
  'permissions/update',
  async (data: { id: number; name: string; resource: string; action: string; description?: string }, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const { id, ...updateData } = data;
      const res = await axios.put(`${Url}/permissions/${id}`, updateData, {
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

export const deletePermissionFn = createAsyncThunk(
  'permissions/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.delete(`${Url}/permissions/${id}`, {
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

const PermissionsManagementSlice = createSlice({
  name: 'permissionsManagement',
  reducers: {
    resetPermissionsManagement: () => initialState
  },
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getAllPermissionsFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getAllPermissionsFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const permissions = Array.isArray(action.payload) ? action.payload : [];
        state.data = permissions;
        state.total = permissions.length;
      })
      .addCase(getAllPermissionsFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(createPermissionFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPermissionFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(createPermissionFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(updatePermissionFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePermissionFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(updatePermissionFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(deletePermissionFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePermissionFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deletePermissionFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  }
});

export const { resetPermissionsManagement } = PermissionsManagementSlice.actions;
export default PermissionsManagementSlice.reducer;

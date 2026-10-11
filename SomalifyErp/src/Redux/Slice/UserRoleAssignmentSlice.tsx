import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UserRoleItem {
  id: number;
  role_id: number;
  role: { id: number; name: string; description: string | null };
}

interface UserRoleAssignmentState {
  userRoles: UserRoleItem[];
  isLoading: boolean;
  isError: boolean;
  errorMsg: string;
  assignLoading: boolean;
  removeLoading: boolean;
}

const initialState: UserRoleAssignmentState = {
  userRoles: [],
  isLoading: false,
  isError: false,
  errorMsg: "",
  assignLoading: false,
  removeLoading: false,
};

// Get company user roles
export const getCompanyUserRolesFn = createAsyncThunk(
  "userRoleAssignment/getCompany",
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/roles/users/${userId}`, {
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

// Get main user roles
export const getMainUserRolesFn = createAsyncThunk(
  "userRoleAssignment/getMain",
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/roles/main-users/${userId}`, {
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

// Assign role to company user
export const assignRoleToCompanyUserFn = createAsyncThunk(
  "userRoleAssignment/assignCompany",
  async (
    { roleId, userId, companyId }: { roleId: number; userId: number; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.post(`${Url}/roles/${roleId}/users/${userId}`, { company_id: companyId }, {
        withCredentials: true,
      });
      return { roleId, userId };
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Assign role to main user
export const assignRoleToMainUserFn = createAsyncThunk(
  "userRoleAssignment/assignMain",
  async (
    { roleId, userId }: { roleId: number; userId: number },
    { rejectWithValue }
  ) => {
    try {
      await axios.post(`${Url}/roles/${roleId}/main-users/${userId}`, {}, {
        withCredentials: true,
      });
      return { roleId, userId };
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Remove role from company user
export const removeRoleFromCompanyUserFn = createAsyncThunk(
  "userRoleAssignment/removeCompany",
  async (
    { roleId, userId }: { roleId: number; userId: number },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`${Url}/roles/${roleId}/users/${userId}`, {
        withCredentials: true,
      });
      return { roleId, userId };
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Remove role from main user
export const removeRoleFromMainUserFn = createAsyncThunk(
  "userRoleAssignment/removeMain",
  async (
    { roleId, userId }: { roleId: number; userId: number },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`${Url}/roles/${roleId}/main-users/${userId}`, {
        withCredentials: true,
      });
      return { roleId, userId };
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

const userRoleAssignmentSlice = createSlice({
  name: "userRoleAssignment",
  initialState,
  reducers: {
    resetUserRoleAssignment: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCompanyUserRolesFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getCompanyUserRolesFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRoles = Array.isArray(action.payload)
          ? action.payload.map((ur: any) => ({
              id: ur.id,
              role_id: ur.role_id,
              role: ur.role,
            }))
          : [];
      })
      .addCase(getCompanyUserRolesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(getMainUserRolesFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getMainUserRolesFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRoles = Array.isArray(action.payload)
          ? action.payload.map((ur: any) => ({
              id: ur.id,
              role_id: ur.role_id,
              role: ur.role,
            }))
          : [];
      })
      .addCase(getMainUserRolesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(assignRoleToCompanyUserFn.pending, (state) => {
        state.assignLoading = true;
      })
      .addCase(assignRoleToCompanyUserFn.fulfilled, (state) => {
        state.assignLoading = false;
      })
      .addCase(assignRoleToCompanyUserFn.rejected, (state, action) => {
        state.assignLoading = false;
        state.errorMsg = String(action.payload);
      })
      .addCase(assignRoleToMainUserFn.pending, (state) => {
        state.assignLoading = true;
      })
      .addCase(assignRoleToMainUserFn.fulfilled, (state) => {
        state.assignLoading = false;
      })
      .addCase(assignRoleToMainUserFn.rejected, (state, action) => {
        state.assignLoading = false;
        state.errorMsg = String(action.payload);
      })
      .addCase(removeRoleFromCompanyUserFn.pending, (state) => {
        state.removeLoading = true;
      })
      .addCase(removeRoleFromCompanyUserFn.fulfilled, (state, action) => {
        state.removeLoading = false;
        state.userRoles = state.userRoles.filter(
          (ur) => ur.role_id !== action.payload.roleId
        );
      })
      .addCase(removeRoleFromCompanyUserFn.rejected, (state, action) => {
        state.removeLoading = false;
        state.errorMsg = String(action.payload);
      })
      .addCase(removeRoleFromMainUserFn.pending, (state) => {
        state.removeLoading = true;
      })
      .addCase(removeRoleFromMainUserFn.fulfilled, (state, action) => {
        state.removeLoading = false;
        state.userRoles = state.userRoles.filter(
          (ur) => ur.role_id !== action.payload.roleId
        );
      })
      .addCase(removeRoleFromMainUserFn.rejected, (state, action) => {
        state.removeLoading = false;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetUserRoleAssignment } = userRoleAssignmentSlice.actions;
export default userRoleAssignmentSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Url, errorMsg } from "@/Interfaces";

interface MainUserData {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_roles?: Array<{
    role: {
      id: number;
      name: string;
    };
  }>;
}

interface MainUsersState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  data: MainUserData[] | MainUserData | null;
  total: number;
  currentUser: MainUserData | null;
}

const initialState: MainUsersState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  data: [],
  total: 0,
  currentUser: null,
};

export const getAllMainUsersFn = createAsyncThunk(
  'getAllMainUsers',
  async (_, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.get(`${Url}/main/auth`, {
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

export const getOneMainUserFn = createAsyncThunk(
  'getOneMainUser',
  async (id: number, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.get(`${Url}/main/auth/${id}`, {
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

export const createMainUserFn = createAsyncThunk(
  'createMainUser',
  async (data: { full_name: string; email: string; password: string; company_id?: string }, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.post(`${Url}/main/auth/signup`, data, {
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

export const updateMainUserFn = createAsyncThunk(
  'updateMainUser',
  async (data: { id: number; full_name?: string; email?: string; password?: string }, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const { id, ...updateData } = data;
      const res = await axios.put(`${Url}/main/auth/${id}`, updateData, {
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

export const deleteMainUserFn = createAsyncThunk(
  'deleteMainUser',
  async (id: number, { rejectWithValue }) => {
    try {
      // Main users use cookie-based authentication, no Bearer token needed
      const res = await axios.delete(`${Url}/main/auth/${id}`, {
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

export const MainUsersSlice = createSlice({
  name: 'mainUsers',
  reducers: {
    resetMainUsers: () => initialState
  },
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getAllMainUsersFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getAllMainUsersFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const users = Array.isArray(action.payload) ? action.payload : [];
        state.data = users;
        state.total = users.length;
      })
      .addCase(getOneMainUserFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getOneMainUserFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentUser = action.payload;
        // Also update data if it's an array
        if (Array.isArray(state.data)) {
          const existingIndex = state.data.findIndex(u => u.id === action.payload.id);
          if (existingIndex >= 0) {
            state.data[existingIndex] = action.payload;
          }
        }
      })
      .addCase(getOneMainUserFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(getAllMainUsersFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(createMainUserFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMainUserFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(createMainUserFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(updateMainUserFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMainUserFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(updateMainUserFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      .addCase(deleteMainUserFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMainUserFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deleteMainUserFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  }
});

export const { resetMainUsers } = MainUsersSlice.actions;
export default MainUsersSlice.reducer;

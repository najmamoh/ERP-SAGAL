import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Url, errorMsg } from '@/Interfaces';

export interface CreateStorePayload {
  store_name: string;
  description?: string;
  location?: string;
  company_ids?: string[];
}

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
};

export const createStoreFn = createAsyncThunk(
  'createStore',
  async (payload: CreateStorePayload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${Url}/stores`, payload, { withCredentials: true });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) return rejectWithValue(error.response.data.message);
        if (error.code === 'ERR_NETWORK' || !error.response) {
          return rejectWithValue('Cannot connect to server. Make sure the backend is running.');
        }
        return rejectWithValue(error.response?.statusText || error.message || errorMsg);
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const CreateStoreSlice = createSlice({
  name: 'createStore',
  reducers: {
    resetCreateStore: () => initialState,
  },
  initialState,
  extraReducers(builder) {
    builder
      .addCase(createStoreFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(createStoreFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(createStoreFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetCreateStore } = CreateStoreSlice.actions;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Url, errorMsg } from '@/Interfaces';

interface StoreDataOne {
  store_id: string;
  store_name: string;
  description: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  store_companies?: { company: { company_id: string; company_name: string; company_email?: string } }[];
}

const initialState = {
  isLoading: false,
  isError: false,
  errorMsg: '',
  data: null as StoreDataOne | null,
};

export const getOneStoreFn = createAsyncThunk(
  'getOneStore',
  async (storeId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/stores/${storeId}`, { withCredentials: true });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) return rejectWithValue(error.response.data.message);
        if (error.code === 'ERR_NETWORK' || !error.response) {
          return rejectWithValue('Cannot connect to server.');
        }
        return rejectWithValue(error.response?.statusText || error.message || errorMsg);
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const GetOneStoreSlice = createSlice({
  name: 'getOneStore',
  reducers: { resetOneStore: () => initialState },
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getOneStoreFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.data = null;
      })
      .addCase(getOneStoreFn.fulfilled, (state, action) => {
        state.isLoading = false;
        const p = action.payload;
        state.data = p?.data ?? p ?? null;
      })
      .addCase(getOneStoreFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetOneStore } = GetOneStoreSlice.actions;

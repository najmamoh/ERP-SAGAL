import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Url, errorMsg } from '@/Interfaces';

export interface StoreCompanyEntry {
  company_id: string;
  company_name: string;
  company_email?: string;
}

export interface StoreData {
  store_id: string;
  store_name: string;
  description: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  store_companies?: { company: StoreCompanyEntry }[];
}

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  data: [] as StoreData[],
};

export const getAllStoresFn = createAsyncThunk(
  'getAllStores',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/stores`, { withCredentials: true });
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

export const GetAllStoresSlice = createSlice({
  name: 'getAllStores',
  reducers: {
    resetAllStores: () => initialState,
  },
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getAllStoresFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllStoresFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        const p = action.payload;
        // Support both direct array and { data: [] } from API
        const list = Array.isArray(p) ? p : (p?.data && Array.isArray(p.data) ? p.data : []);
        state.data = list ?? [];
      })
      .addCase(getAllStoresFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetAllStores } = GetAllStoresSlice.actions;

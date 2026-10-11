import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Url, errorMsg } from '@/Interfaces';

export interface LinkedStoreProduct {
  product_id: number;
  product: {
    product_id: number;
    product_code: string;
    product_name: string;
    product_price: string | number;
    product_cost?: string | number;
  };
  quantity: number;
}

export interface LinkedStore {
  store_id: string;
  store_name: string;
  description: string | null;
  location: string | null;
  products?: LinkedStoreProduct[];
}

interface LinkedStoresResponse {
  stores: LinkedStore[];
  products: LinkedStoreProduct[];
}

const initialState = {
  isLoading: false,
  isError: false,
  errorMsg: '',
  stores: [] as LinkedStore[],
  products: [] as LinkedStoreProduct[],
};

export const getLinkedStoresByCompanyFn = createAsyncThunk(
  'linkedStores/getByCompany',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get<LinkedStoresResponse>(
        `${Url}/stores/linked-to-company/${companyId}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || errorMsg);
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const LinkedStoresSlice = createSlice({
  name: 'linkedStores',
  initialState,
  reducers: {
    resetLinkedStores: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLinkedStoresByCompanyFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getLinkedStoresByCompanyFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stores = action.payload.stores ?? [];
        state.products = action.payload.products ?? [];
      })
      .addCase(getLinkedStoresByCompanyFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetLinkedStores } = LinkedStoresSlice.actions;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Url, errorMsg } from '@/Interfaces';

export interface UpdateStorePayload {
  store_id: string;
  store_name?: string;
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

export const updateStoreFn = createAsyncThunk(
  'updateStore',
  async (payload: UpdateStorePayload, { rejectWithValue }) => {
    try {
      const { store_id, ...body } = payload;
      const res = await axios.put(`${Url}/stores/${store_id}`, body, { withCredentials: true });
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

export const UpdateStoreSlice = createSlice({
  name: 'updateStore',
  reducers: { resetUpdateStore: () => initialState },
  initialState,
  extraReducers(builder) {
    builder
      .addCase(updateStoreFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(updateStoreFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(updateStoreFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetUpdateStore } = UpdateStoreSlice.actions;

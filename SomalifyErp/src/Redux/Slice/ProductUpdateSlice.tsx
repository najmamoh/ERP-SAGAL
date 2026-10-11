import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdateProductFn = createAsyncThunk(
  'UpdateProduct',
  async (data: any, { rejectWithValue }) => {
    try {
      const productId = data.product_id;

      const payload = {
        product_code: data.product_code,
        product_name: data.product_name,
        product_price: data.product_price,
        product_cost: data.product_cost !== '' && data.product_cost != null ? data.product_cost : undefined,
        product_alert_number: data.product_alert_number,
        category: data.category ?? undefined,
        description: data.description ?? undefined,
      };

      const response = await axios.put(`${Url}/products/${productId}`, payload, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const UpdateProductSlice = createSlice({
  name: 'UpdateProduct',
  initialState,
  reducers: { resetProductUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateProductFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdateProductFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdateProductFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetProductUpdates } = UpdateProductSlice.actions;
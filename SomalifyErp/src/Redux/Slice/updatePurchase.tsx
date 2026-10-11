import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdatePurchaseData {
    purchase_qty: number;
    item_cost: string;
    purchase_discount: string;
    paid_amount: string;
    purchase_id: number;
    manufacture_date: string;
    expiry_date: string;
    product_id:number;
    
    
}

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdatePurchaseFn = createAsyncThunk(
  'UpdatePurchase',
  async (data: UpdatePurchaseData, { rejectWithValue }) => {
    try {
      // const Company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;
      const { purchase_id, ...updateData } = data;
    //   const id=data.purchase_id
    //   const vendorWithCompanyId = {
    //     ...data,
    //       // id: data.purchase_id
    //   };

      const response = await axios.put(`${Url}/purchases/${purchase_id}`, updateData,{
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

export const UpdatePurchaseSlice = createSlice({
  name: 'UpdatePurchase',
  initialState,
  reducers: { resetPurchaseUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdatePurchaseFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdatePurchaseFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdatePurchaseFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetPurchaseUpdates } = UpdatePurchaseSlice.actions;



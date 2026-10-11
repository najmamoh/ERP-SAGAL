import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";


interface PayPayablData {
  purchase_id: number;
  new_paid_amount: string;
  new_purchase_discount: string;
  company_id?: string; // For superAdmin when paying another company's payable
}


const initialState = {
    data: null,
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
  };


  export const PayPayablFn = createAsyncThunk(
    'UpdateVendor',
    async (data:PayPayablData, { rejectWithValue }) => {
      try {
        
        // const vendorWithCompanyId = {
        //   ...data,
        //     // id: data.vendor_id
        // };

        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const companyId = data.company_id || userInfo.company_id || userInfo.user?.company_id || "";

        const response = await axios.post(`${Url}/payables/products${companyId ? `?company_id=${companyId}` : ""}`, {
          purchase_id: data.purchase_id,
          new_paid_amount: data.new_paid_amount,
          new_purchase_discount: data.new_purchase_discount,
        }, {
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
  

  export const PayPAyableSlice = createSlice({
    name: 'UpdateVendor',
    initialState,
    reducers: { resetPayablesPayment: () => initialState },
    extraReducers: (builder) => {
      builder
        .addCase(PayPayablFn.pending, (state) => {
          state.isLoading = true;
          state.IsSuccess = false;
          state.isError = false;
          state.errorMsg = '';
        })
        .addCase(PayPayablFn.fulfilled, (state, action) => {
          state.isLoading = false;
          state.IsSuccess = true;
          state.data = action.payload;
        })
        .addCase(PayPayablFn.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.errorMsg = action.payload as string;
        });
    },
  });
  
  export const { resetPayablesPayment } = PayPAyableSlice.actions;
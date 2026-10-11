import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";


interface PayReceiveData {
  invoice_id?: string;
  sale_id?: number;
  new_received_amount: string;
  new_sale_discount: string;
}


const initialState = {
    data: null,
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
  };


  export const PayReceiveFn = createAsyncThunk(
    'recievAbles',
    async (data:PayReceiveData, { rejectWithValue }) => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo")!);
        const Company_Id = userInfo.company_id;
        const token = userInfo.accessToken;

        const response = await axios.post(`${Url}/receivables/products?company_id=${Company_Id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  

  export const PayReceiveAbleSlice = createSlice({
    name: 'Receiveale',
    initialState,
    reducers: { resetReceiveablePayment: () => initialState },
    extraReducers: (builder) => {
      builder
        .addCase(PayReceiveFn.pending, (state) => {
          state.isLoading = true;
          state.IsSuccess = false;
          state.isError = false;
          state.errorMsg = '';
        })
        .addCase(PayReceiveFn.fulfilled, (state, action) => {
          state.isLoading = false;
          state.IsSuccess = true;
          state.data = action.payload;
        })
        .addCase(PayReceiveFn.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.errorMsg = action.payload as string;
        });
    },
  });
  
  export const { resetReceiveablePayment } = PayReceiveAbleSlice.actions;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdateExpensesData {
    item_name:string,
    item_qty:number
    item_cost:string
    paid_amount:string
    date:string
    expense_id:number
    
}

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdateExpensesFn = createAsyncThunk(
  'UpdateVendor',
  async (data: UpdateExpensesData, { rejectWithValue }) => {
    try {
    //   const Company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;

      const id=data.expense_id
      const vendorWithCompanyId = {
        ...data,
          // id: data.vendor_id
      };
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo.accessToken;
      const response = await axios.put(`${Url}/otherexpenses/${id}`, vendorWithCompanyId,{
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

export const UpdateExpensesSlice = createSlice({
  name: 'UpdateExpenses',
  initialState,
  reducers: { resetExpensesUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateExpensesFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdateExpensesFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdateExpensesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetExpensesUpdates } = UpdateExpensesSlice.actions;


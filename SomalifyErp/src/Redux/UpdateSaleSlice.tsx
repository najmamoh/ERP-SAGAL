import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdateSaleData {
    sale_id:number,
    sale_qty: number;
    item_price: string;
    sale_discount: string;
    received_amount: string;
    taxable_sale?: boolean;
    
}

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdateSaleFn = createAsyncThunk(
  'UpdateSale',
  async (data: UpdateSaleData, { rejectWithValue }) => {
    try {
      // const Company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;
      const id=data.sale_id
      const vendorWithCompanyId = {
        ...data,
          // id: data.sale_id
      };
      // const token= JSON.parse(localStorage.getItem("userInfo")!).accessToken;
      const response = await axios.put(`${Url}/sales/${id}`, vendorWithCompanyId,{
        // headers: {
        //     Authorization: `Bearer ${token}`,
        // },
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

export const UpdateSaleSlice = createSlice({
  name: 'UpdateSale',
  initialState,
  reducers: { resetSaleUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateSaleFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdateSaleFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdateSaleFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetSaleUpdates } = UpdateSaleSlice.actions;

export default UpdateSaleSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdateVendorData {
  vendor_name: string;
  vendor_address: string;
  vendor_email: string;
  vendor_phone: string;
  vendor_id:number
}

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdateVendorFn = createAsyncThunk(
  'UpdateVendor',
  async (data: UpdateVendorData, { rejectWithValue }) => {
    try {
      // const Company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;
      const id=data.vendor_id
      const vendorWithCompanyId = {
        ...data,
          // id: data.vendor_id
      };

      const response = await axios.put(`${Url}/vendors/${id}`, vendorWithCompanyId,{
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

export const UpdateVendorSlice = createSlice({
  name: 'UpdateVendor',
  initialState,
  reducers: { resetVendorUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateVendorFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdateVendorFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdateVendorFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetVendorUpdates } = UpdateVendorSlice.actions;

export default UpdateVendorSlice.reducer;

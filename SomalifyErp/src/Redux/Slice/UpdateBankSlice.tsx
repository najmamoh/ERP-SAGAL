import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdateBankData {
  bank_name: string;
  amount: string;
  sale_id?: number | null;
  bank_id:number
}

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdateBankFn = createAsyncThunk(
  'UpdateBank',
  async (data: UpdateBankData, { rejectWithValue }) => {
    try {
      const id=data.bank_id
      const bankWithCompanyId = {
        ...data,
      };
      const token= JSON.parse(localStorage.getItem("userInfo")!).accessToken;
      const response = await axios.put(`${Url}/Banks/${id}`, bankWithCompanyId,{
        headers: {
            Authorization: `Bearer ${token}`,
        }
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

export const UpdateBankSlice = createSlice({
  name: 'UpdateBank',
  initialState,
  reducers: { resetBankUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateBankFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdateBankFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdateBankFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetBankUpdates } = UpdateBankSlice.actions;

export default UpdateBankSlice.reducer;

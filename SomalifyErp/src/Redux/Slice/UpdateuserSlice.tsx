import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdateUserData {
    full_name: string;
    email: string;
    password: string;
    role: string;
  user_id:number
}

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdateUserFn = createAsyncThunk(
  'UpdateUser',
  async (data: UpdateUserData, { rejectWithValue }) => {
    try {
    //   const Company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;
      const id=data.user_id
      const vendorWithCompanyId = {
        ...data,
          // id: data.vendor_id
      };

      const response = await axios.put(`${Url}/auth/${id}`, vendorWithCompanyId,{
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

export const UpdateUserSlice = createSlice({
  name: 'UpdateUser',
  initialState,
  reducers: { resetUserUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateUserFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdateUserFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdateUserFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetUserUpdates } = UpdateUserSlice.actions;



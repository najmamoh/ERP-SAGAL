import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdateSalaryData {
    paid_amount:string
    date:string
    employee_id:number
    salary_id:number
}

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdateSalaryFn = createAsyncThunk(
  'UpdateVendor',
  async (data: UpdateSalaryData, { rejectWithValue }) => {
    try {
      // const Company_Id = JSON.parse(localStorage.getItem("userInfo")!).user.company_id;

      const id=data.salary_id
      const vendorWithCompanyId = {
        ...data,
          // id: data.vendor_id
      };
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo.accessToken;
      const response = await axios.put(`${Url}/salaries/${id}`, vendorWithCompanyId,{
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

export const UpdateSalarySlice = createSlice({
  name: 'Updatesalary',
  initialState,
  reducers: { resetSalaryUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateSalaryFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdateSalaryFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdateSalaryFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetSalaryUpdates } = UpdateSalarySlice.actions;


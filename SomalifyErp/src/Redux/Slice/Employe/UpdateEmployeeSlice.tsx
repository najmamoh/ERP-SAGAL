import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdateEmployData {
    employee_id:string
    employee_name: string,
    employee_address: string,
    employee_phone: string,
    salary_amount:string,
   
}

const initialState = {
  data: null,
  IsSuccess: false,
  isLoading: false,
  isError: false,
  errorMsg: '',
};

export const UpdateEmployeeFn = createAsyncThunk(
  'UpdateEmploye',
  async (data: UpdateEmployData, { rejectWithValue }) => {
    try {
    //   const Company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;

      const id=data.employee_id
      const employeeWithCompanyId = {
        ...data,
          // id: data.vendor_id
      };
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo.accessToken;
      const response = await axios.put(`${Url}/employees/${id}`, employeeWithCompanyId,{
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

export const UpdateEmployeeSlice = createSlice({
  name: 'UpdateEmployee',
  initialState,
  reducers: { resetemployeeUpdates: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(UpdateEmployeeFn.pending, (state) => {
        state.isLoading = true;
        state.IsSuccess = false;
        state.isError = false;
        state.errorMsg = '';
      })
      .addCase(UpdateEmployeeFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.data = action.payload;
      })
      .addCase(UpdateEmployeeFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetemployeeUpdates } = UpdateEmployeeSlice.actions;


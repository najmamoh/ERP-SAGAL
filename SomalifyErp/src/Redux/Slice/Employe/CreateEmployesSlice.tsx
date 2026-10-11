import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createEmployeesData {
    employee_name: string,
    employee_address: string,
    employee_phone: string,
    salary_amount:string,
    company_id: string;
}

const initialState = {
    data: [],
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createEmployeesFn = createAsyncThunk(
    'createCustomer',
    async (data: createEmployeesData[], { rejectWithValue }) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
            const Company_Id = data[0]?.company_id || userInfo.user?.company_id || userInfo.company_id;

            if (!Company_Id) {
                return rejectWithValue('Company is required. Please select a company.');
            }

            // Add company_id to each employee data
            const Data = data.map(employee => ({
                ...employee,
                company_id: Company_Id
            }));

            // Send the array of vendor data
            const response = await axios.post(`${Url}/employees`, Data,{
                withCredentials: true,
              });

            return response.data;
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                if (error.response?.data?.message) {
                    return rejectWithValue(error.response.data.message);
                }
                if (error.code === 'ERR_NETWORK' || !error.response) {
                    return rejectWithValue('Cannot connect to server. Make sure the backend is running on port 8181.');
                }
                return rejectWithValue(error.response?.statusText || error.message || errorMsg);
            }
            return rejectWithValue(errorMsg);
        }
    }
);

export const createEmployeesSlice = createSlice({
    name: 'create/Customer',
    initialState,
    reducers: { resetEmployesCr: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createEmployeesFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createEmployeesFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createEmployeesFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetEmployesCr } = createEmployeesSlice.actions;


import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface AllSalaryData {
    salary_id: number;
    paid_amount: string;
    date: string;
    employee_id: number;
    created_at: string;
    updated_at: string;
    employees: {
        employee_id: string;
        employee_name: string;
        employee_address: string;
        employee_phone: string;
        salary_amount: string;
        company_id: string;
        created_at: string;
        updated_at: string;
    };
}

interface SalaryState {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    errorMsg: string;
    data: AllSalaryData[];
}

const initialState: SalaryState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    data: [],
};

export const getAllSalariesFn = createAsyncThunk(
    'getAllSalaries',
    async (_, { rejectWithValue }) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo")!);
            if (!userInfo) return rejectWithValue("User not authenticated");

            const companyId = userInfo.company_id;

            const res = await axios.get(`${Url}/salaries?company_id=${companyId}&page_number=1&page_size=10`, {
                withCredentials: true,
            });

            return res.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data.message || errorMsg);
            }
            return rejectWithValue(errorMsg);
        }
    }
);

export const GetAllSalariesSlice = createSlice({
    name: 'getAllSalaries',
    initialState,
    reducers: {
        resetAllSalaries: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(getAllSalariesFn.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.isSuccess = false;
        });
        builder.addCase(getAllSalariesFn.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.data = action.payload;
        });
        builder.addCase(getAllSalariesFn.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.errorMsg = String(action.payload);
        });
    },
});

export const { resetAllSalaries } = GetAllSalariesSlice.actions;


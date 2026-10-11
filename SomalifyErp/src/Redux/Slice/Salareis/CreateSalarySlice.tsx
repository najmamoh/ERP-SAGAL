import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createSalaryData {
    paid_amount: string;
    date: string;
    employee_id: number;
}

const initialState = {
    data: {} as createSalaryData,
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createSalaryFn = createAsyncThunk(
    'createSalary',
    async (data: createSalaryData, { rejectWithValue }) => {
        try {
            // Backend uses cookie auth and validates employee/company,
            // so we only need to send the salary payload.
            const response = await axios.post(`${Url}/salaries`, data, {
                withCredentials: true,
            });

            return response.data;
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                // Prefer backend message when available
                if (error.response?.data?.message) {
                    return rejectWithValue(error.response.data.message);
                }
                // Clearer message for real network issues
                if (error.code === 'ERR_NETWORK' || !error.response) {
                    return rejectWithValue(
                        'Cannot connect to server. Make sure the backend is running on port 8181.'
                    );
                }
                return rejectWithValue(errorMsg);
            }
            return rejectWithValue(errorMsg);
        }
    }
);

export const createSalarySlice = createSlice({
    name: 'create/salary',
    initialState,
    reducers: { resetSalary: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createSalaryFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createSalaryFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createSalaryFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetSalary } = createSalarySlice.actions;
;

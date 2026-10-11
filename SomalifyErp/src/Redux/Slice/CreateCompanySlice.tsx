import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface CreateCompanyData {
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    taxable: boolean;
    tax_percentage: number;
}

const initialState = {
    isLoading: false,
    isError: false,
    IsSuccess: false,
    errorMsg: '',
};

export const createCompanyFn = createAsyncThunk(
    'createCompany',
    async (data: CreateCompanyData, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `${Url}/companies`,
                data,
                {
                    withCredentials: true, // Cookies sent automatically
                }
            );

            return res.data;
        } catch (error) {
            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

export const CreateCompanySlice = createSlice({
    name: 'createCompany',
    reducers: {
        resetCreateCompany: () => initialState
    },
    initialState,
    extraReducers(builder) {
        builder.addCase(createCompanyFn.pending, () => ({
            ...initialState,
            isLoading: true
        }));
        builder.addCase(createCompanyFn.fulfilled, () => ({
            ...initialState,
            IsSuccess: true,
        }));
        builder.addCase(createCompanyFn.rejected, (_, action) => ({
            ...initialState,
            isError: true,
            errorMsg: String(action.payload),
        }));
    }
});

export const { resetCreateCompany } = CreateCompanySlice.actions;

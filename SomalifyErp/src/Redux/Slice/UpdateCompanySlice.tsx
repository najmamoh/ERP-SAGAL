import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UpdateCompanyData {
    company_id: string;
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    taxable: boolean;
    tax_percentage: number;
    isBanned: boolean;
}

const initialState = {
    isLoading: false,
    isError: false,
    IsSuccess: false,
    errorMsg: '',
};

export const UpdateCompanyFn = createAsyncThunk(
    'updateCompany',
    async (data: UpdateCompanyData, { rejectWithValue }) => {
        try {
            const { company_id, ...updateData } = data;
            
            const res = await axios.put(
                `${Url}/companies/${company_id}`,
                updateData,
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

export const UpdateCompanySlice = createSlice({
    name: 'updateCompany',
    reducers: {
        resetUpdateCompany: () => initialState
    },
    initialState,
    extraReducers(builder) {
        builder.addCase(UpdateCompanyFn.pending, () => ({
            ...initialState,
            isLoading: true
        }));
        builder.addCase(UpdateCompanyFn.fulfilled, () => ({
            ...initialState,
            IsSuccess: true,
        }));
        builder.addCase(UpdateCompanyFn.rejected, (_, action) => ({
            ...initialState,
            isError: true,
            errorMsg: String(action.payload),
        }));
    }
});

export const { resetUpdateCompany } = UpdateCompanySlice.actions;

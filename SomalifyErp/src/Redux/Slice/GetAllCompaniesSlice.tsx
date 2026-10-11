import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

const handleCompaniesError = (error: unknown, rejectWithValue: (val: string) => any) => {
    if (error instanceof AxiosError) {
        if (error.response?.data?.message) return rejectWithValue(error.response.data.message);
        if (error.code === 'ERR_NETWORK' || !error.response) {
            return rejectWithValue('Cannot connect to server. Make sure the backend is running.');
        }
        return rejectWithValue(error.response?.statusText || error.message || errorMsg);
    }
    return rejectWithValue(errorMsg);
};

interface CompanyData {
    company_id: string;
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    subscribtion_fee: string;
    taxable: boolean;
    tax_percentage: number;
    isBanned: boolean;
    debt?: string | number;
    created_at: string;
    updated_at: string;
    created_by: number | null;
}

interface CompaniesState {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    errorMsg: string;
    data: CompanyData[];
    total: number;
}

const initialState: CompaniesState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    data: [],
    total: 0,
};

export const getAllCompaniesFn = createAsyncThunk(
    'getAllCompanies',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${Url}/companies`, {
                withCredentials: true, // Cookies sent automatically
            });

            return res.data;
        } catch (error) {
            return handleCompaniesError(error, rejectWithValue);
        }
    }
);

export const GetAllCompaniesSlice = createSlice({
    name: 'getAllCompanies',
    reducers: {
        resetAllCompanies: () => initialState
    },
    initialState,
    extraReducers(builder) {
        builder.addCase(getAllCompaniesFn.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.isSuccess = false;
        });
        builder.addCase(getAllCompaniesFn.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            // Handle both array response and object with data property
            const companiesData = Array.isArray(action.payload) 
                ? action.payload 
                : (action.payload?.data || []);
            state.data = companiesData;
            state.total = Array.isArray(companiesData) ? companiesData.length : 0;
        });
        builder.addCase(getAllCompaniesFn.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.errorMsg = String(action.payload);
        });
    }
});

export const { resetAllCompanies } = GetAllCompaniesSlice.actions;

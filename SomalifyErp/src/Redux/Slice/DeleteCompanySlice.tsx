import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

const initialState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
};

export const delCompanyFn = createAsyncThunk(
    'deleteCompany',
    async (company_id: string, { rejectWithValue }) => {
        try {

            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const token = userInfo.accessToken;
            const res = await axios.delete(
                `${Url}/companies/${company_id}`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
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

export const DeleteCompanySlice = createSlice({
    name: 'deleteCompany',
    reducers: {
        resetDelCompany: () => initialState
    },
    initialState,
    extraReducers(builder) {
        builder.addCase(delCompanyFn.pending, () => ({
            ...initialState,
            isLoading: true
        }));
        builder.addCase(delCompanyFn.fulfilled, () => ({
            ...initialState,
            isSuccess: true,
        }));
        builder.addCase(delCompanyFn.rejected, (_, action) => ({
            ...initialState,
            isError: true,
            errorMsg: String(action.payload),
        }));
    }
});

export const { resetDelCompany } = DeleteCompanySlice.actions;

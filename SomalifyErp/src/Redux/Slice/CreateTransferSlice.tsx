import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createTransferData {
    amount: string;
    currency_type: string;
    payment_method: string;
    bank_id?: number;
    treasury_id:number;}

const initialState = {
    data: [] as any[],
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createTransferFn = createAsyncThunk(
    'createTransfer',
    async (data: createTransferData[], { rejectWithValue }) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo")!);
            const company_id = userInfo?.user?.company_id ?? userInfo?.company_id;
            const token = userInfo?.accessToken;

            if (!company_id) {
                return rejectWithValue("Company ID not found. Please log in again.");
            }

            const responses = await Promise.all(
                data.map(transfer => {
                    const transferData = {
                        amount: transfer.amount,
                        currency_type: transfer.currency_type,
                        payment_method: transfer.payment_method,
                        company_id: String(company_id),
                    };
                    return axios.post(`${Url}/transfer-money`, transferData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true
                    });
                })
            );

            return responses.map(res => res.data);
        } catch (error) {
            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

export const createTransferSlice = createSlice({
    name: 'create/Transfer',
    initialState,
    reducers: { resetTransfer: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createTransferFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createTransferFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createTransferFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetTransfer } = createTransferSlice.actions;

export default createTransferSlice.reducer;

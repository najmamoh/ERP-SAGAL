import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createBankData {
    bank_name: string;
    amount: string;
    sale_id?: number | null;
}

const initialState = {
    data: [],
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createBankFn = createAsyncThunk(
    'createBank',
    async (data: createBankData[], { rejectWithValue }) => {
        try {
            const token= JSON.parse(localStorage.getItem("userInfo")!).accessToken;

            // Send the array of bank data
            const response = await axios.post(`${Url}/Banks`, data,{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
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

export const createBankSlice = createSlice({
    name: 'create/Bank',
    initialState,
    reducers: { resetBank: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createBankFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createBankFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createBankFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetBank } = createBankSlice.actions;

export default createBankSlice.reducer;

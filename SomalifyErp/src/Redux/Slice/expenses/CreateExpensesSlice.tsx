import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createExpensesData {
    item_name:string
    item_qty:number
    item_cost:string
    paid_amount:string
    date:string
    // company_id:string
}

const initialState = {
    data: {} as createExpensesData ,
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createExpensesFn = createAsyncThunk(
    'createSale',
    async (data: createExpensesData, { rejectWithValue }) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo")!);
            const company_id = userInfo.company_id;
            const token = userInfo.accessToken;

            const Data = {
                ...data,
                company_id
            };
            const response = await axios.post(`${Url}/otherexpenses`, Data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

export const createExpensesSlice = createSlice({
    name: 'create/Sale',
    initialState,
    reducers: { resetExpenses: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createExpensesFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createExpensesFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createExpensesFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetExpenses } = createExpensesSlice.actions;
;

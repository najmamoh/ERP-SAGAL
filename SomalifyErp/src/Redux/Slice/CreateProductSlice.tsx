import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createProductData {
    product_code: string;
    product_name: string;
    product_alert_number: number;
    product_price: string;
    category?: string;
    description?: string;
}

const initialState = {
    data: [],
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createProductFn = createAsyncThunk(
    'createProduct',
    async (data: createProductData[], { rejectWithValue }) => {
        try {
            const CreateProData = data.map(product => ({
                product_code: product.product_code,
                product_name: product.product_name,
                product_alert_number: product.product_alert_number ?? 30,
                product_price: product.product_price,
                category: product.category || undefined,
                description: product.description || undefined,
            }));

            const response = await axios.post(`${Url}/products`, CreateProData, {
                withCredentials: true,
            });

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data?.message || errorMsg);
            if (error instanceof Error)
                return rejectWithValue(error.message);
            return rejectWithValue(errorMsg);
        }
    }
);

export const createProductSlice = createSlice({
    name: 'create/product',
    initialState,
    reducers: { resetProduct: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createProductFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createProductFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createProductFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetProduct } = createProductSlice.actions;
export default createProductSlice.reducer;



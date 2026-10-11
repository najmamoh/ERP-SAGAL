import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createSaleData {
    sale_qty: number;
    item_price: string;
    sale_discount: string;
    received_amount: string;
    purchase_id?: number;       // When selling from purchase
    stock_id?: number;          // When selling from company store (warehouse_stock)
    customer_id?: number | null;
    taxable_sale?: boolean;
}

const initialState = {
    data: [],
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createSaleFn = createAsyncThunk(
    'createSale',
    async (data: createSaleData[], { rejectWithValue }) => {
        try {
            // const Company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;

            // Add company_id to each vendor data
            const Data = data.map(Sale => ({
                ...Sale,
                // company_id: Company_Id
            }));

            // Send the array of vendor data
            const response = await axios.post(`${Url}/sales`, Data ,{
                withCredentials: true, // Cookies sent automatically
              } );

            return response.data;
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

export const createSaleSlice = createSlice({
    name: 'create/Sale',
    initialState,
    reducers: { resetSale: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createSaleFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createSaleFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createSaleFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetSale } = createSaleSlice.actions;
;

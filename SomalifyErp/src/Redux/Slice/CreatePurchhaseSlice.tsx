import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createPurchasetData {
    purchase_qty: number;
    item_cost: string;
    purchase_discount: string;
    paid_amount: string;
    vendor_id: number;
    product_id: number;
    manufacture_date: string;
    expiry_date: string;
    container_number?: string;
    to_store?: boolean; // If true, go directly to company store, otherwise go to warehouse first
}

const initialState = {
    data: [],
    isSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const CreatePurchaseFn = createAsyncThunk(
    'create/Purchase',
    async(data: createPurchasetData, { rejectWithValue }) => {
        try {
            // const userInfo= JSON.parse(localStorage.getItem("userInfo")!)
            // const company_id =userInfo.company_id

            // const formData = new FormData();
            // formData.append('purchase_qty', data.purchase_qty.toString());
            // formData.append('item_cost', data.item_cost);
            // formData.append('purchase_discount', data.purchase_discount);
            // formData.append('paid_amount', data.paid_amount);
            // formData.append('vendor_id', data.vendor_id.toString());
            // formData.append('product_id', data.product_id.toString());
            // formData.append('manufacture_date', data.manufacture_date);
            // formData.append('expiry_date', data.expiry_date);

            // Log the FormData entries
            // for (const [key, value] of formData.entries()) {
            //     console.log(`${key}: ${value}`);
            // }

            const res = await axios.post(`${Url}/purchases`, data,{
                withCredentials: true,
              });
            return res.data;

        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

export const CreatePurchaseSlice = createSlice({
    name: "create/Purchase",
    reducers: { resetPurchase: () => initialState },
    initialState,
    extraReducers(builder) {
        builder.addCase(CreatePurchaseFn.fulfilled, (_, action) => ({
            ...initialState,
            isSuccess: true,
            data: action.payload
        }));

        builder.addCase(CreatePurchaseFn.pending, () => ({
            ...initialState,
            isLoading: true
        }));

        builder.addCase(CreatePurchaseFn.rejected, (_, action) => ({
            ...initialState,
            isError: true,
            errorMsg: String(action.payload)
        }));
    },
});

export const { resetPurchase } = CreatePurchaseSlice.actions;

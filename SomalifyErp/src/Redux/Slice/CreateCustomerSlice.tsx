import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createCustomerData {
    customer_name: string,
    customer_phone: string,
    customer_address: string,
    company_id: string;
}

const initialState = {
    data: [],
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createCustomerFn = createAsyncThunk(
    'createCustomer',
    async (data: createCustomerData[], { rejectWithValue }) => {
        try {
            const raw = localStorage.getItem("userInfo");
            const userInfo = raw ? JSON.parse(raw) : {};
            const token = userInfo.accessToken ?? userInfo.token;
            const companyId = (data[0]?.company_id || userInfo.user?.company_id) ?? userInfo.company_id;

            if (!companyId) {
                return rejectWithValue('Company ID is required. Please sign in again or select a company.');
            }

            const Data = data.map(Customer => ({
                customer_name: Customer.customer_name,
                customer_phone: Customer.customer_phone,
                customer_address: Customer.customer_address,
                company_id: Customer.company_id || companyId,
            }));

            const response = await axios.post(`${Url}/customers`, Data, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
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

export const createCustomerSlice = createSlice({
    name: 'create/Customer',
    initialState,
    reducers: { resetCustomer: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createCustomerFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createCustomerFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createCustomerFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetCustomer } = createCustomerSlice.actions;


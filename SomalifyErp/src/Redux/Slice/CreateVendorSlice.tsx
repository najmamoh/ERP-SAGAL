import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface createVendorData {
    vendor_name: string;
    vendor_address: string;
    vendor_email: string;
    vendor_phone: string;
    company_id?: string | null; // Optional for admin users
}

const initialState = {
    data: [],
    IsSuccess: false,
    isLoading: false,
    isError: false,
    errorMsg: '',
};

export const createVendorFn = createAsyncThunk(
    'createVendor',
    async (data: createVendorData[], { rejectWithValue }) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
            const company_id = userInfo.user?.company_id || userInfo.company_id;
            const isAdminDashboard = window.location.pathname.startsWith('/AdminDashboard');
            
            // For admin users (main users), company_id is optional
            // For normal users, company_id is required
            const vendorsData = data.map(vendor => {
                const vendorData: any = {
                    vendor_name: vendor.vendor_name,
                    vendor_address: vendor.vendor_address,
                    vendor_email: vendor.vendor_email,
                    vendor_phone: vendor.vendor_phone,
                };
                
                // Admin users can optionally specify company_id from the form
                // If not provided and user has company_id, use it; otherwise leave null
                if (isAdminDashboard && !company_id) {
                    // Admin user without company - use company_id from vendor data if provided, otherwise null
                    vendorData.company_id = vendor.company_id || null;
                } else if (company_id) {
                    // Normal user or admin user with company_id
                    vendorData.company_id = vendor.company_id || company_id;
                } else {
                    // Fallback: use company_id from vendor data if provided
                    vendorData.company_id = vendor.company_id || null;
                }
                
                return vendorData;
            });

            // Send the array of vendor data
            const response = await axios.post(`${Url}/vendors`, vendorsData, {
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

export const createVendorSlice = createSlice({
    name: 'create/Vendor',
    initialState,
    reducers: { resetVendor: () => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(createVendorFn.pending, (state) => {
                state.isLoading = true;
                state.IsSuccess = false;
                state.isError = false;
                state.errorMsg = '';
            })
            .addCase(createVendorFn.fulfilled, (state, action) => {
                state.isLoading = false;
                state.IsSuccess = true;
                state.data = action.payload;
            })
            .addCase(createVendorFn.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMsg = action.payload as string;
            });
    },
});

export const { resetVendor } = createVendorSlice.actions;

export default createVendorSlice.reducer;

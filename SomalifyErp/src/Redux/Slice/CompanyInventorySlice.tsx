import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";
import { getCookie } from "@/lib/cookies";

interface CompanyInventoryItem {
  stock_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: {
    product_id: number;
    product_code: string;
    product_name: string;
    product_cost: string;
    product_price: string;
    product_alert_number: number;
  };
}

interface CompanyInventoryState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  data: CompanyInventoryItem[];
  total: number;
}

const initialState: CompanyInventoryState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  data: [],
  total: 0,
};

export const getCompanyInventoryFn = createAsyncThunk(
  'companyInventory/getAll',
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const raw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
      const userInfo = raw ? JSON.parse(raw) : {};
      const companyId = userInfo.user?.company_id || userInfo.company_id;

      if (!companyId) {
        return rejectWithValue("Company not found");
      }

      const params: any = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const res = await axios.get(`${Url}/stores/company/${companyId}/inventory`, {
        params,
        withCredentials: true,
      });

      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const CompanyInventorySlice = createSlice({
  name: 'companyInventory',
  reducers: {
    resetCompanyInventory: () => initialState,
  },
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getCompanyInventoryFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getCompanyInventoryFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = action.payload.data || [];
        state.total = action.payload.total || 0;
      })
      .addCase(getCompanyInventoryFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export const { resetCompanyInventory } = CompanyInventorySlice.actions;
export default CompanyInventorySlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";
import { getCookie } from "@/lib/cookies";

interface dataDate {
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
  company_id?: string;
}

interface saleData {
  sale_id: number | string;
  invoice_sale_id?: number | string;
  invoice_id?: string | null;
  invoice_number?: string;
  status?: string;
  sale_qty: number;
  unit_purchase_cost?: string;
  line_purchase_cost?: string;
  unit_sale_price?: string;
  item_cost: string;
  item_price: string;
  sale_discount: string;
  received_amount: string;
  /** Line net sale − line cost (accrual gross margin) */
  gross_profit?: string;
  /** Cash received − line cost */
  profit?: string;
  balance_due?: string;
  product_code: string;
  product_name: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  sold_by?: string;
  created_at?: string;
}

// interface SalesResponse {
//   data: saleData[];
//   total: number;
//   page: number;
//   pageSize: number;
//   hasMore: boolean;
// }

export interface ReportSummary {
  total_cost: string;
  total_sale_price: string;
  total_discount: string;
  total_received: string;
  /** Cash: sum(received − line cost) */
  total_profit: string;
  /** Accrual: sum(line net − line cost) */
  total_gross_profit?: string;
  total_balance_due: string;
  row_count: number;
}

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  data: [] as saleData[],
  total: 0,
  page: 1,
  pageSize: 20,
  hasMore: false,
  report_summary: null as ReportSummary | null,
};

export const getAllSaleFn = createAsyncThunk(
  'getAllSale',
  async (Data: dataDate, { rejectWithValue }) => {
    try {
      const raw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
      const userInfo = raw ? JSON.parse(raw) : {};
      const company_Id = Data.company_id ?? userInfo.user?.company_id ?? userInfo.company_id;
      const token = userInfo.accessToken ?? userInfo.token ?? getCookie("userInfo") ? JSON.parse(getCookie("userInfo") || "{}").accessToken : undefined;
      const res = await axios.get(
        `${Url}/reports/sales?company_id=${company_Id}` +
        `&start_date=${Data.startDate}&end_date=${Data.endDate}` +
        `&page=${Data.page || 1}&pageSize=${Data.pageSize || 20}`, 
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

export const GetAllSaleSlice = createSlice({
  name: 'getallSales',
  reducers: {
    resteAllSale: () => initialState,
    setPagination: (state, action) => {
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
    }
  },
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getAllSaleFn.pending, (state) => ({
        ...state,
        isLoading: true
      }))
      .addCase(getAllSaleFn.fulfilled, (state, action) => ({
        ...state,
        isLoading: false,
        isSuccess: true,
        data: Array.isArray(action.payload?.data) ? action.payload.data : [],
        total: Number(action.payload?.total) ?? 0,
        page: Number(action.payload?.page) ?? 1,
        pageSize: Number(action.payload?.pageSize) ?? 20,
        hasMore: Boolean(action.payload?.hasMore),
        report_summary: action.payload?.report_summary ?? null,
      }))
      .addCase(getAllSaleFn.rejected, (state, action) => ({
        ...state,
        isLoading: false,
        isError: true,
        errorMsg: String(action.payload),
      }));
  }
});

export const { resteAllSale, setPagination } = GetAllSaleSlice.actions;
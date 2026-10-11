import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";
import { getCookie } from "@/lib/cookies";

export interface CompanyExpenseItem {
  expense_id: number;
  item_name: string;
  item_qty: number;
  item_cost: string;
  paid_amount: string;
  date: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  companies?: {
    company_name: string;
    company_id: string;
  } | null;
}

export interface CompanyExpensesResponse {
  /** API returns `data`; support legacy `otherExpenses` */
  data?: CompanyExpenseItem[];
  otherExpenses?: CompanyExpenseItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

interface CompanyExpensesState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  data: CompanyExpenseItem[];
  total: number;
  page: number;
  pageSize: number;
}

const initialState: CompanyExpensesState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: "",
  data: [],
  total: 0,
  page: 1,
  pageSize: 20,
};

interface GetCompanyExpensesParams {
  page: number;
  pageSize: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  company_id?: string;
}

export const getCompanyExpensesFn = createAsyncThunk<
  CompanyExpensesResponse,
  GetCompanyExpensesParams,
  { rejectValue: string }
>(
  "companyExpenses/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const raw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
      const userInfo = raw ? JSON.parse(raw) : {};
      const isAdminDashboard = window.location.pathname.startsWith('/AdminDashboard');
      const roles = userInfo.user?.roles || userInfo.roles || [];
      const isMainAdmin = isAdminDashboard && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));
      
      // For admin users, company_id is optional (can be passed as parameter)
      // For normal users, get company_id from userInfo
      const companyId = params.company_id || (userInfo.user?.company_id ?? userInfo.company_id);
      
      // Admin users don't need company_id - they can view all expenses
      // Normal users must have company_id
      if (!isMainAdmin && !companyId) {
        return rejectWithValue("Company not found");
      }
      
      const token = userInfo.accessToken;
      const requestParams: any = {
        page: params.page,
        pageSize: params.pageSize,
        ...(params.search && params.search.trim() && { search: params.search.trim() }),
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
      };
      
      // Only add company_id if it exists (for admin users, it's optional)
      if (companyId) {
        requestParams.company_id = companyId;
      }
      
      const res = await axios.get(`${Url}/otherexpenses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: requestParams,
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

export const CompanyExpensesSlice = createSlice({
  name: "companyExpenses",
  initialState,
  reducers: {
    resetCompanyExpenses: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(getCompanyExpensesFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getCompanyExpensesFn.fulfilled, (state, action: PayloadAction<CompanyExpensesResponse>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = action.payload.data ?? action.payload.otherExpenses ?? [];
        state.total = action.payload.total ?? 0;
        state.page = action.payload.page ?? 1;
        state.pageSize = action.payload.pageSize ?? 20;
      })
      .addCase(getCompanyExpensesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload ?? errorMsg;
      });
  },
});

export const { resetCompanyExpenses } = CompanyExpensesSlice.actions;
export default CompanyExpensesSlice.reducer;

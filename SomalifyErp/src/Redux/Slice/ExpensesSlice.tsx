// src/Redux/Slice/ExpensesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

// ─── Interfaces ────────────────────────────────────────────────────────────────
export interface SalaryExpense {
  salary_id: number;
  paid_amount: string;
  date: string;
  employee_id: number;
  created_at: string;
  updated_at: string;
  employee_name: string;
  employee_address: string;
  employee_phone: string;
  salary_amount: string;
  company_id: string;
}

export interface OtherExpense {
  expense_id: number;
  item_name: string;
  item_qty: number;
  item_cost: string;
  paid_amount: string;
  date: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExpensesSection<T> {
  data: T[];
  total: number;
  totalAmount?: number;
  totalPaid?: number;
  totalUnpaid?: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ExpensesResponse {
  salaryExpenses: ExpensesSection<SalaryExpense>;
  otherExpenses: ExpensesSection<OtherExpense>;
}

interface ExpensesState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  data: ExpensesResponse;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface DateRange {
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
  company_id?: string;
}

// ─── Initial State ────────────────────────────────────────────────────────────
const initialResponse: ExpensesResponse = {
  salaryExpenses: { data: [], total: 0, page: 1, pageSize: 20, hasMore: false },
  otherExpenses:  { data: [], total: 0, page: 1, pageSize: 20, hasMore: false },
};

const initialState: ExpensesState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: "",
  data: initialResponse,
  page: 1,
  pageSize: 20,
  hasMore: false,
};

// ─── Async Thunk ───────────────────────────────────────────────────────────────
export const getAllExpensesReport = createAsyncThunk<
  ExpensesResponse,
  DateRange,
  { rejectValue: string }
>(
  "expenses/getAll",
  async ({ startDate, endDate, company_id }, { rejectWithValue }) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const company_Id = company_id || userInfo.user?.company_id || userInfo.company_id;
      if (!company_Id) {
        return rejectWithValue("Company ID is required");
      }
      // No page/pageSize — expenses report returns all rows between start and end date
      const res = await axios.get<ExpensesResponse>(
        `${Url}/reports/expenses` +
        `?company_id=${company_Id}` +
        `&start_date=${startDate}&end_date=${endDate}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        return rejectWithValue(err.response?.data.message || errorMsg);
      }
      return rejectWithValue(errorMsg);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
export const expensesSliceReport = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    resetExpenses: () => initialState,
    setExpensesPagination(
      state,
      action: PayloadAction<{ page: number; pageSize: number }>
    ) {
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllExpensesReport.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMsg = "";
      })
      .addCase(getAllExpensesReport.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = payload;
        state.page = payload.salaryExpenses.page;
        state.pageSize = payload.salaryExpenses.pageSize;
        state.hasMore = payload.salaryExpenses.hasMore;
      })
      .addCase(getAllExpensesReport.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = payload || "Something went wrong";
      });
  },
});

export const { resetExpenses, setExpensesPagination } = expensesSliceReport.actions;


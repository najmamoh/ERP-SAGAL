import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

export interface UnpaidExpenseRow {
  expense_id: number;
  item_name: string;
  item_qty: number;
  item_cost: string | number;
  paid_amount: string | number;
  line_total: string | number;
  unpaid_amount: string | number;
  payment_status: "unpaid" | "partial" | string;
  date: string;
  company_id: string;
}

export interface UnpaidExpensesReportData {
  data: UnpaidExpenseRow[];
  total: number;
  totalLineAmount: number;
  totalPaid: number;
  totalUnpaid: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
  company_id?: string;
}

const emptyData: UnpaidExpensesReportData = {
  data: [],
  total: 0,
  totalLineAmount: 0,
  totalPaid: 0,
  totalUnpaid: 0,
};

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: "",
  data: emptyData,
};

export const getUnpaidExpensesReportFn = createAsyncThunk(
  "unpaidExpensesReport/getAll",
  async (Data: DateRange, { rejectWithValue }) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const company_Id =
        Data.company_id || userInfo.user?.company_id || userInfo.company_id;
      if (!company_Id) {
        return rejectWithValue("Company ID is required");
      }
      const res = await axios.get<UnpaidExpensesReportData>(
        `${Url}/reports/expenses/unpaid` +
          `?company_id=${company_Id}` +
          `&start_date=${Data.startDate}&end_date=${Data.endDate}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data.message || errorMsg);
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const UnpaidExpensesReportSlice = createSlice({
  name: "unpaidExpensesReport",
  initialState,
  reducers: {
    resetUnpaidExpensesReport: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(getUnpaidExpensesReportFn.pending, () => ({
        ...initialState,
        isLoading: true,
      }))
      .addCase(getUnpaidExpensesReportFn.fulfilled, (_, action) => ({
        ...initialState,
        isSuccess: true,
        data: action.payload,
      }))
      .addCase(getUnpaidExpensesReportFn.rejected, (_, action) => ({
        ...initialState,
        isError: true,
        errorMsg: String(action.payload),
      }));
  },
});

export const { resetUnpaidExpensesReport } = UnpaidExpensesReportSlice.actions;

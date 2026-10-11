// Redux/Slice/GetAllTransactions.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

interface TransactionData {
  transaction_id: number;
  bank_name: string;
  amount: string;
  currency_type: string;
  company_id: string | null;
  company_name?: string;
  company?: { company_name: string };
  created_at?: string;
}

interface TransactionsState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  data: TransactionData[];
  total: number;
  page: number;
  pageSize: number;
}

const initialState: TransactionsState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: "",
  data: [],
  total: 0,
  page: 1,
  pageSize: 20,
};

export const getAllTransactionsFn = createAsyncThunk(
  "transactions/getAll",
  async (
    params: { page: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo")!);
      const res = await axios.get(`${Url}/transfer-money`, {
        headers: {
          Authorization: `Bearer ${userInfo.accessToken}`,
        },
        params: {
          company_id: userInfo.company_id,
          page: params.page,
          pageSize: params.pageSize,
        },
      });

      return res.data; // { data, total, page, pageSize }
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || errorMsg);
      }
      return rejectWithValue(errorMsg);
    }
  }
);

const GetAllTransactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllTransactionsFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllTransactionsFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        state.data = action.payload.data;   // ✅ ARRAY
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllTransactionsFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
  },
});

export default GetAllTransactionsSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Url } from "@/Interfaces";
import { getCookie } from "@/lib/cookies";

export interface CompanyTreasuryBalance {
  company_id: string;
  company_name: string;
  treasury_id: string | null;
  balance: number;
}

interface TreasuryState {
  treasuries: any[];
  banksList: any[];
  banksLoading: boolean;
  balance: number | null;
  balanceLoading: boolean;
  companyBalances: CompanyTreasuryBalance[];
  companyBalancesTotal: number;
  companyBalancesLoading: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
}

const initialState: TreasuryState = {
  treasuries: [],
  banksList: [],
  banksLoading: false,
  balance: null,
  balanceLoading: false,
  companyBalances: [],
  companyBalancesTotal: 0,
  companyBalancesLoading: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: "",
};

// ---------------- GET BANKING ACCOUNTS FOR TRANSFER ----------------
export const getBanksForTransferFn = createAsyncThunk(
  "treasury/getBanks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/banking`, {
        withCredentials: true,
      });
      const data = res.data;
      const list = data?.accounts ?? [];
      return Array.isArray(list) ? list : [];
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to fetch banking accounts";
      return rejectWithValue(msg);
    }
  }
);

// ---------------- GET TREASURY BALANCE ----------------
export const getTreasuryBalanceFn = createAsyncThunk(
  "treasury/getBalance",
  async (params: { company_id?: string } | void, { rejectWithValue }) => {
    try {
      const userRaw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
      const userInfo = userRaw ? JSON.parse(userRaw) : {};
      const company_id = params?.company_id ?? userInfo.company_id ?? userInfo.user?.company_id;

      const res = await axios.get(`${Url}/treasury/balance`, {
        withCredentials: true,
        params: company_id ? { company_id } : {},
      });
      const raw = res.data?.balance;
      if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
      if (typeof raw === "string") return Number(raw) || 0;
      if (raw != null && typeof raw === "object" && "$numberDecimal" in raw) return Number((raw as { $numberDecimal: string }).$numberDecimal) || 0;
      return 0;
    } catch (error: any) {
      const data = error.response?.data;
      const msg = typeof data === "object" && data?.message ? data.message : typeof data === "string" ? data : "Error fetching balance";
      return rejectWithValue(msg);
    }
  }
);

/** Admin: balances for all companies (optional company_id filter). */
export const getAllCompanyBalancesFn = createAsyncThunk(
  "treasury/getAllBalances",
  async (params: { company_id?: string } | void, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/treasury/balances`, {
        withCredentials: true,
        params: params?.company_id ? { company_id: params.company_id } : {},
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const total = Number(res.data?.total_balance) || 0;
      return {
        data: list.map((row: any) => ({
          company_id: row.company_id,
          company_name: row.company_name,
          treasury_id: row.treasury_id ?? null,
          balance: Number(row.balance) || 0,
        })) as CompanyTreasuryBalance[],
        total_balance: total,
      };
    } catch (error: any) {
      const data = error.response?.data;
      const msg = typeof data === "object" && data?.message ? data.message : typeof data === "string" ? data : "Error fetching company balances";
      return rejectWithValue(msg);
    }
  }
);

// ---------------- GET ALL TREASURIES (optional type: 'sent' | 'received', company_id) ----------------
export const getAllTreasuriesFn = createAsyncThunk(
  "treasury/getAll",
  async (params: { type?: "sent" | "received"; company_id?: string } | undefined, { rejectWithValue }) => {
    try {
      const userRaw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
      const userInfo = userRaw ? JSON.parse(userRaw) : {};
      const company_id = params?.company_id ?? userInfo.company_id ?? userInfo.user?.company_id;

      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.set("type", params.type);
      if (company_id) queryParams.set("company_id", company_id);
      const query = queryParams.toString() ? `?${queryParams}` : "";

      const res = await axios.get(`${Url}/treasury/transfers${query}`, {
        withCredentials: true,
      });
      return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    } catch (error: any) {
      const data = error.response?.data;
      const msg = typeof data === "object" && data?.message ? data.message : typeof data === "string" ? data : "Error fetching treasuries";
      return rejectWithValue(msg);
    }
  }
);

// ---------------- CONFIRM TRANSFER ----------------
export const confirmTransferFn = createAsyncThunk(
  "treasury/confirmTransfer",
  async (transferId: string, { rejectWithValue }) => {
    try {
      await axios.post(
        `${Url}/treasury/transfers/${transferId}/confirm`,
        {},
        { withCredentials: true }
      );
      return transferId;
    } catch (error: any) {
      const data = error.response?.data;
      const msg = typeof data === "object" && data?.message ? data.message : typeof data === "string" ? data : "Error confirming transfer";
      return rejectWithValue(msg);
    }
  }
);

// ---------------- CANCEL TRANSFER ----------------
export const cancelTransferFn = createAsyncThunk(
  "treasury/cancelTransfer",
  async (transferId: string, { rejectWithValue }) => {
    try {
      await axios.post(
        `${Url}/treasury/transfers/${transferId}/cancel`,
        {},
        { withCredentials: true }
      );
      return transferId;
    } catch (error: any) {
      const data = error.response?.data;
      const msg = typeof data === "object" && data?.message ? data.message : typeof data === "string" ? data : "Error cancelling transfer";
      return rejectWithValue(msg);
    }
  }
);

// ---------------- CREATE DEPOSIT (add funds to treasury) ----------------
export const createDepositFn = createAsyncThunk(
  "treasury/createDeposit",
  async (payload: { amount: number; description?: string }, { rejectWithValue }) => {
    try {
      const userRaw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
      const userInfo = userRaw ? JSON.parse(userRaw) : {};
      const company_id = userInfo.company_id ?? userInfo.user?.company_id;
      const res = await axios.post(
        `${Url}/treasury/deposit`,
        { amount: payload.amount, description: payload.description, company_id },
        { withCredentials: true }
      );
      return res.data;
    } catch (error: any) {
      const data = error.response?.data;
      const msg = typeof data === "object" && data?.message ? data.message : typeof data === "string" ? data : "Error creating deposit";
      return rejectWithValue(msg);
    }
  }
);

// ---------------- REQUEST BANK WITHDRAWAL ----------------
export const requestWithdrawalFn = createAsyncThunk(
  "treasury/requestWithdrawal",
  async (payload: { bank_id: string; amount: number }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${Url}/treasury/withdraw-request`,
        { bank_id: payload.bank_id, amount: payload.amount },
        { withCredentials: true }
      );
      return res.data;
    } catch (error: any) {
      const data = error.response?.data;
      const msg = typeof data === "object" && data?.message ? data.message : typeof data === "string" ? data : "Error requesting withdrawal";
      return rejectWithValue(msg);
    }
  }
);

// ---------------- CREATE TREASURY ----------------
export const createTreasuryFn = createAsyncThunk(
  "treasury/create",
  async (payload: any, { rejectWithValue }) => {
    try {
      const userRaw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
      const userInfo = userRaw ? JSON.parse(userRaw) : {};
      const company_id = payload.company_id ?? userInfo.company_id ?? userInfo.user?.company_id;
      const body = company_id ? { ...payload, company_id } : payload;

      const res = await axios.post(
        `${Url}/treasury/transfers`,
        body,
        { withCredentials: true }
      );
      return res.data;
    } catch (error: any) {
      const data = error.response?.data;
      const msg = typeof data === "object" && data?.message ? data.message : typeof data === "string" ? data : "Error creating treasury";
      return rejectWithValue(msg);
    }
  }
);

// ---------------- SLICE ----------------
const TreasurySlice = createSlice({
  name: "treasury",
  initialState,
  reducers: {
    resetTreasuryState: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.errorMsg = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // GET BANKS
      .addCase(getBanksForTransferFn.pending, (state) => {
        state.banksLoading = true;
        state.banksList = [];
      })
      .addCase(getBanksForTransferFn.fulfilled, (state, action) => {
        state.banksLoading = false;
        state.banksList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getBanksForTransferFn.rejected, (state) => {
        state.banksLoading = false;
        state.banksList = [];
      })
      // GET BALANCE
      .addCase(getTreasuryBalanceFn.pending, (state) => {
        state.balanceLoading = true;
      })
      .addCase(getTreasuryBalanceFn.fulfilled, (state, action) => {
        state.balanceLoading = false;
        state.balance = action.payload;
      })
      .addCase(getTreasuryBalanceFn.rejected, (state) => {
        state.balanceLoading = false;
      })
      // GET ALL COMPANY BALANCES (admin)
      .addCase(getAllCompanyBalancesFn.pending, (state) => {
        state.companyBalancesLoading = true;
      })
      .addCase(getAllCompanyBalancesFn.fulfilled, (state, action) => {
        state.companyBalancesLoading = false;
        state.companyBalances = action.payload.data;
        state.companyBalancesTotal = action.payload.total_balance;
      })
      .addCase(getAllCompanyBalancesFn.rejected, (state) => {
        state.companyBalancesLoading = false;
        state.companyBalances = [];
        state.companyBalancesTotal = 0;
      })
      // GET ALL
      .addCase(getAllTreasuriesFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllTreasuriesFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.treasuries = action.payload;
      })
      .addCase(getAllTreasuriesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      })
      // CREATE DEPOSIT
      .addCase(createDepositFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDepositFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.balance = null;
      })
      .addCase(createDepositFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = typeof action.payload === "string" ? action.payload : (action.payload as any)?.message ?? "Error creating deposit";
      })
      // CREATE TREASURY
      .addCase(createTreasuryFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTreasuryFn.fulfilled, (state, _action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.balance = null;
      })
      .addCase(createTreasuryFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = typeof action.payload === "string" ? action.payload : (action.payload as any)?.message ?? "Error creating treasury";
      })
      .addCase(confirmTransferFn.fulfilled, (state) => {
        state.errorMsg = "";
      })
      .addCase(confirmTransferFn.rejected, (state, action) => {
        state.isError = true;
        state.errorMsg = typeof action.payload === "string" ? action.payload : (action.payload as any)?.message ?? "Error confirming transfer";
      })
      .addCase(cancelTransferFn.fulfilled, (state) => {
        state.errorMsg = "";
      })
      .addCase(cancelTransferFn.rejected, (state, action) => {
        state.isError = true;
        state.errorMsg = typeof action.payload === "string" ? action.payload : (action.payload as any)?.message ?? "Error cancelling transfer";
      })
      // WITHDRAWAL REQUEST
      .addCase(requestWithdrawalFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.errorMsg = "";
      })
      .addCase(requestWithdrawalFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(requestWithdrawalFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = typeof action.payload === "string" ? action.payload : (action.payload as any)?.message ?? "Error requesting withdrawal";
      });
  },
});

export const { resetTreasuryState } = TreasurySlice.actions;
export default TreasurySlice.reducer;

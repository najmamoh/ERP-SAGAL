import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

interface BankingAccount {
  account_id: string;
  account_name: string;
  balance: number | string;
  created_at: string;
}

interface BankingTransaction {
  transaction_id?: string;
  account_id: string;
  account_name?: string;
  amount: number | string;
  type: 'deposit' | 'withdrawal';
  description: string;
  created_at?: string;
  from_branch?: string | null;
}

interface BankingData {
  account_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
}

interface BankingState {
  accounts: BankingAccount[];
  selectedAccountId: string | null;
  transactions: BankingTransaction[];
  isLoading: boolean;
  isError: boolean;
  IsSuccess: boolean;
  errorMsg: string;
}

const initialState: BankingState = {
  accounts: [],
  selectedAccountId: null,
  transactions: [],
  isLoading: false,
  isError: false,
  IsSuccess: false,
  errorMsg: '',
};

// Get banking balance and transactions
export const getBankingDataFn = createAsyncThunk(
  'banking/getData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${Url}/banking`, {
        withCredentials: true, // Cookies sent automatically
      });

      // Transform backend response to match frontend format
      const accounts = (response.data.accounts || []).map((acc: any) => ({
        account_id: acc.account_id,
        account_name: acc.account_name,
        balance: typeof acc.balance === 'string' ? parseFloat(acc.balance) : acc.balance,
        created_at: acc.created_at,
      }));

      const transactions = (response.data.transactions || []).map((t: any) => ({
        transaction_id: t.transaction_id,
        account_id: t.account_id,
        account_name: t.account?.account_name || accounts.find((a: any) => a.account_id === t.account_id)?.account_name || '',
        amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
        type: t.type,
        description: t.description || '',
        created_at: t.created_at,
        from_branch: t.from_branch || null,
      }));

      return {
        accounts,
        selectedAccountId: response.data.selectedAccountId || accounts[0]?.account_id || null,
        transactions,
      };
    } catch (error) {
      console.error('Error fetching banking data:', error);
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Add money (deposit)
export const addMoneyFn = createAsyncThunk(
  'banking/addMoney',
  async (data: BankingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${Url}/banking/deposit`,
        {
          account_id: data.account_id,
          amount: data.amount,
          description: data.description,
        },
        {
          withCredentials: true, // Cookies sent automatically
        }
      );

      // Transform response
      const accounts = (response.data.accounts || []).map((acc: any) => ({
        account_id: acc.account_id,
        account_name: acc.account_name,
        balance: typeof acc.balance === 'string' ? parseFloat(acc.balance) : acc.balance,
        created_at: acc.created_at,
      }));

      const transactions = (response.data.transactions || []).map((t: any) => ({
        transaction_id: t.transaction_id,
        account_id: t.account_id,
        account_name: t.account?.account_name || accounts.find((a: any) => a.account_id === t.account_id)?.account_name || '',
        amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
        type: t.type,
        description: t.description || '',
        created_at: t.created_at,
        from_branch: t.from_branch || null,
      }));

      return {
        accounts,
        selectedAccountId: response.data.selectedAccountId || data.account_id,
        transactions,
      };
    } catch (error) {
      console.error('Error adding money:', error);
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Remove money (withdrawal)
export const removeMoneyFn = createAsyncThunk(
  'banking/removeMoney',
  async (data: BankingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${Url}/banking/withdraw`,
        {
          account_id: data.account_id,
          amount: data.amount,
          description: data.description,
        },
        {
          withCredentials: true, // Cookies sent automatically
        }
      );

      // Transform response
      const accounts = (response.data.accounts || []).map((acc: any) => ({
        account_id: acc.account_id,
        account_name: acc.account_name,
        balance: typeof acc.balance === 'string' ? parseFloat(acc.balance) : acc.balance,
        created_at: acc.created_at,
      }));

      const transactions = (response.data.transactions || []).map((t: any) => ({
        transaction_id: t.transaction_id,
        account_id: t.account_id,
        account_name: t.account?.account_name || accounts.find((a: any) => a.account_id === t.account_id)?.account_name || '',
        amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
        type: t.type,
        description: t.description || '',
        created_at: t.created_at,
        from_branch: t.from_branch || null,
      }));

      return {
        accounts,
        selectedAccountId: response.data.selectedAccountId || data.account_id,
        transactions,
      };
    } catch (error) {
      console.error('Error removing money:', error);
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Create new account
export const createAccountFn = createAsyncThunk(
  'banking/createAccount',
  async (accountName: string, { rejectWithValue }) => {
    try {
      console.log('createAccountFn called with:', accountName);

      if (!accountName || !accountName.trim()) {
        console.error('Account name is empty');
        return rejectWithValue('Account name is required');
      }

      const response = await axios.post(
        `${Url}/banking/accounts`,
        {
          account_name: accountName.trim(),
        },
        {
          withCredentials: true, // Cookies sent automatically
        }
      );

      console.log('Account creation response:', response.data);

      // Transform response
      const accounts = (response.data.accounts || []).map((acc: any) => ({
        account_id: acc.account_id,
        account_name: acc.account_name,
        balance: typeof acc.balance === 'string' ? parseFloat(acc.balance) : acc.balance,
        created_at: acc.created_at,
      }));

      const transactions = (response.data.transactions || []).map((t: any) => ({
        transaction_id: t.transaction_id,
        account_id: t.account_id,
        account_name: t.account?.account_name || accounts.find((a: any) => a.account_id === t.account_id)?.account_name || '',
        amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
        type: t.type,
        description: t.description || '',
        created_at: t.created_at,
        from_branch: t.from_branch || null,
      }));

      console.log('Transformed accounts:', accounts);
      console.log('Selected account ID:', response.data.selectedAccountId);

      return {
        accounts,
        selectedAccountId: response.data.selectedAccountId || accounts[0]?.account_id || null,
        transactions,
      };
    } catch (error) {
      console.error('Error creating account:', error);
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || errorMsg;
        console.error('Error message:', errorMessage);
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error instanceof Error ? error.message : errorMsg);
    }
  }
);

// Delete account
export const deleteAccountFn = createAsyncThunk(
  'banking/deleteAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
      const token = userInfo.accessToken;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await axios.delete(
        `${Url}/banking/accounts/${accountId}`,
        {
          withCredentials: true, // Cookies sent automatically
        }
      );

      // Transform response
      const accounts = (response.data.accounts || []).map((acc: any) => ({
        account_id: acc.account_id,
        account_name: acc.account_name,
        balance: typeof acc.balance === 'string' ? parseFloat(acc.balance) : acc.balance,
        created_at: acc.created_at,
      }));

      const transactions = (response.data.transactions || []).map((t: any) => ({
        transaction_id: t.transaction_id,
        account_id: t.account_id,
        account_name: t.account?.account_name || accounts.find((a: any) => a.account_id === t.account_id)?.account_name || '',
        amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
        type: t.type,
        description: t.description || '',
        created_at: t.created_at,
        from_branch: t.from_branch || null,
      }));

      return {
        accounts,
        selectedAccountId: response.data.selectedAccountId || accounts[0]?.account_id || null,
        transactions,
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const BankingSlice = createSlice({
  name: 'banking',
  initialState,
  reducers: {
    resetBanking: (state) => {
      // Only reset loading and success flags, keep the data
      state.isLoading = false;
      state.isError = false;
      state.IsSuccess = false;
      state.errorMsg = '';
    },
    setSelectedAccount: (state, action) => {
      state.selectedAccountId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Banking Data
      .addCase(getBankingDataFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.IsSuccess = false;
        state.errorMsg = '';
      })
      .addCase(getBankingDataFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.accounts = action.payload.accounts || [];
        state.selectedAccountId = action.payload.selectedAccountId || null;
        state.transactions = action.payload.transactions || [];
      })
      .addCase(getBankingDataFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      })
      // Add Money
      .addCase(addMoneyFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.IsSuccess = false;
        state.errorMsg = '';
      })
      .addCase(addMoneyFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.accounts = action.payload.accounts;
        state.transactions = action.payload.transactions;
      })
      .addCase(addMoneyFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      })
      // Remove Money
      .addCase(removeMoneyFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.IsSuccess = false;
        state.errorMsg = '';
      })
      .addCase(removeMoneyFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.accounts = action.payload.accounts;
        state.transactions = action.payload.transactions;
      })
      .addCase(removeMoneyFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      })
      // Create Account
      .addCase(createAccountFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.IsSuccess = false;
        state.errorMsg = '';
      })
      .addCase(createAccountFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.isError = false;
        state.errorMsg = '';
        // Ensure we're setting the accounts array correctly
        state.accounts = action.payload.accounts || [];
        state.selectedAccountId = action.payload.selectedAccountId || null;
        state.transactions = action.payload.transactions || state.transactions || [];
        console.log('Redux state updated - accounts:', state.accounts);
        console.log('Redux state updated - account count:', state.accounts.length);
      })
      .addCase(createAccountFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      })
      // Delete Account
      .addCase(deleteAccountFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.IsSuccess = false;
        state.errorMsg = '';
      })
      .addCase(deleteAccountFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.IsSuccess = true;
        state.accounts = action.payload.accounts;
        state.selectedAccountId = action.payload.selectedAccountId;
        state.transactions = action.payload.transactions;
      })
      .addCase(deleteAccountFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = action.payload as string;
      });
  },
});

export const { resetBanking, setSelectedAccount } = BankingSlice.actions;
export default BankingSlice.reducer;

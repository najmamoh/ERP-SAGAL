import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";

interface WarehouseData {
  warehouse_id: number;
  warehouse_name: string;
  location: string | null;
  description: string | null;
  is_active: boolean;
  is_default?: boolean;
  company_id?: string | null;
  created_at: string;
  updated_at: string;
  stock?: WarehouseStock[];
}

interface WarehouseStock {
  stock_id: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
  reserved_qty: number;
  product: {
    product_id: number;
    product_code: string;
    product_name: string;
    product_cost: string;
    companies: {
      company_id: string;
      company_name: string;
    };
  };
}

interface TransferData {
  transfer_id: number;
  warehouse_id: number;
  stock_id: number;
  company_id: string;
  product_id: number;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  created_by: number | null;
  warehouse: WarehouseData;
  to_warehouse?: { warehouse_name?: string } | null;
  product: {
    product_id: number;
    product_code: string;
    product_name: string;
    product_cost: string;
    companies: {
      company_id: string;
      company_name: string;
    };
  };
  company: {
    company_id: string;
    company_name: string;
  };
}

export interface TransferDestinationItem {
  store_name: string;
  company_name: string;
  warehouse_id: number;
}

interface WarehouseState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMsg: string;
  warehouses: WarehouseData[];
  transfers: TransferData[];
  selectedWarehouseStock: WarehouseStock[];
  total: number;
  transferTotal: number;
  companyStore: (WarehouseData & { stock?: WarehouseStock[]; company?: { company_id: string; company_name: string } }) | null;
  transfersToCompany: TransferData[];
  transferDestinations: TransferDestinationItem[];
  transferDestinationsLoading: boolean;
  /** After calling ensure-warehouses, map company_id -> warehouse_id + company_name for building dropdown from stores */
  companyWarehousesEnsured: { company_id: string; warehouse_id: number; company_name: string }[];
  ensuringCompanyWarehouses: boolean;
}

const initialState: WarehouseState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  warehouses: [],
  transfers: [],
  selectedWarehouseStock: [],
  total: 0,
  transferTotal: 0,
  companyStore: null,
  transfersToCompany: [],
  transferDestinations: [],
  transferDestinationsLoading: false,
  companyWarehousesEnsured: [],
  ensuringCompanyWarehouses: false,
};

// Get all warehouses
export const getAllWarehousesFn = createAsyncThunk(
  'warehouse/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/warehouse`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Get transfer destinations (stores + company warehouse_id for dropdown; backend ensures each company has a warehouse)
export const getTransferDestinationsFn = createAsyncThunk(
  'warehouse/getTransferDestinations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/warehouse/transfer-destinations`, {
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

// Ensure each company has a warehouse (backend creates if missing). Use when transfer-destinations is empty but we have stores.
export const ensureCompanyWarehousesFn = createAsyncThunk(
  'warehouse/ensureCompanyWarehouses',
  async (companyIds: string[], { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${Url}/warehouse/ensure-warehouses`,
        { company_ids: companyIds },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Create warehouse
export const createWarehouseFn = createAsyncThunk(
  'warehouse/create',
  async (data: { warehouse_name: string; location?: string; description?: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${Url}/warehouse`, data, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Get warehouse stock
export const getWarehouseStockFn = createAsyncThunk(
  'warehouse/getStock',
  async (warehouseId: number, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/warehouse/stock/${warehouseId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Get all transfers
export const getAllTransfersFn = createAsyncThunk(
  'warehouse/getTransfers',
  async (params: { status?: string; page?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/warehouse/transfers`, {
        params,
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Create transfer (warehouse/store -> warehouse/store)
export const createTransferFn = createAsyncThunk(
  'warehouse/createTransfer',
  async (data: { warehouse_id: number; to_warehouse_id: number; product_id: number; quantity: number; notes?: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${Url}/warehouse/transfer`, data, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Approve transfer
export const approveTransferFn = createAsyncThunk(
  'warehouse/approveTransfer',
  async (transferId: number, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${Url}/warehouse/transfers/${transferId}/approve`, {}, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Complete transfer
export const completeTransferFn = createAsyncThunk(
  'warehouse/completeTransfer',
  async (transferId: number, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${Url}/warehouse/transfers/${transferId}/complete`, {}, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Cancel transfer
export const cancelTransferFn = createAsyncThunk(
  'warehouse/cancelTransfer',
  async (transferId: number, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${Url}/warehouse/transfers/${transferId}/cancel`, {}, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Get company's store (warehouse) and its stock (with optional search/filter)
export const getStoreByCompanyFn = createAsyncThunk(
  'warehouse/getStoreByCompany',
  async (
    params: string | { companyId: string; search?: string; category?: string; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const companyId = typeof params === 'string' ? params : params.companyId;
      const query = typeof params === 'string' ? {} : {
        search: params.search || undefined,
        category: params.category || undefined,
        page: params.page || undefined,
        pageSize: params.pageSize || undefined,
      };
      const res = await axios.get(`${Url}/warehouse/by-company/${companyId}`, {
        params: query,
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

// Get transfers sent TO this company (for approve/decline)
export const getTransfersToCompanyFn = createAsyncThunk(
  'warehouse/getTransfersToCompany',
  async (
    params: { companyId: string; status?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.get(
        `${Url}/warehouse/transfers/to-company/${params.companyId}`,
        { params: { status: params.status }, withCredentials: true }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data?.message || errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Transfer all company purchases into main warehouse
export const transferFromCompaniesFn = createAsyncThunk(
  'warehouse/transferFromCompanies',
  async (
    params: { warehouse_id?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post(
        `${Url}/warehouse/transfer-from-companies`,
        params.warehouse_id ? { warehouse_id: params.warehouse_id } : {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          return rejectWithValue(error.response.data.message);
        }
        if (error.code === 'ERR_NETWORK' || !error.response) {
          return rejectWithValue('Cannot connect to server. Make sure the backend is running on port 8181.');
        }
        return rejectWithValue(error.response?.statusText || error.message || errorMsg);
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const WarehouseSlice = createSlice({
  name: 'warehouse',
  reducers: {
    resetWarehouse: () => initialState,
  },
  initialState,
  extraReducers(builder) {
    builder
      // Get all warehouses
      .addCase(getAllWarehousesFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getAllWarehousesFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.warehouses = action.payload.data || action.payload || [];
        state.total = action.payload.total || state.warehouses.length;
      })
      .addCase(getAllWarehousesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Get transfer destinations
      .addCase(getTransferDestinationsFn.pending, (state) => {
        state.transferDestinationsLoading = true;
      })
      .addCase(getTransferDestinationsFn.fulfilled, (state, action) => {
        state.transferDestinationsLoading = false;
        const raw = action.payload?.data ?? action.payload;
        state.transferDestinations = Array.isArray(raw) ? raw : [];
      })
      .addCase(getTransferDestinationsFn.rejected, (state) => {
        state.transferDestinationsLoading = false;
        state.transferDestinations = [];
      })
      // Ensure company warehouses (fallback when transfer-destinations empty)
      .addCase(ensureCompanyWarehousesFn.pending, (state) => {
        state.ensuringCompanyWarehouses = true;
      })
      .addCase(ensureCompanyWarehousesFn.fulfilled, (state, action) => {
        state.ensuringCompanyWarehouses = false;
        const raw = action.payload?.data ?? action.payload;
        state.companyWarehousesEnsured = Array.isArray(raw) ? raw : [];
      })
      .addCase(ensureCompanyWarehousesFn.rejected, (state) => {
        state.ensuringCompanyWarehouses = false;
        state.companyWarehousesEnsured = [];
      })
      // Create warehouse
      .addCase(createWarehouseFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createWarehouseFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload) {
          state.warehouses = [action.payload as WarehouseData, ...(state.warehouses || [])];
          state.total = state.warehouses.length;
        }
      })
      .addCase(createWarehouseFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Get warehouse stock
      .addCase(getWarehouseStockFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWarehouseStockFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedWarehouseStock = action.payload.data || action.payload || [];
      })
      .addCase(getWarehouseStockFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Get all transfers
      .addCase(getAllTransfersFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllTransfersFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transfers = action.payload.data || action.payload || [];
        state.transferTotal = action.payload.total || state.transfers.length;
      })
      .addCase(getAllTransfersFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Create transfer
      .addCase(createTransferFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTransferFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(createTransferFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Approve transfer
      .addCase(approveTransferFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approveTransferFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(approveTransferFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Complete transfer
      .addCase(completeTransferFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeTransferFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(completeTransferFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Cancel transfer
      .addCase(cancelTransferFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelTransferFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(cancelTransferFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Transfer from companies
      .addCase(transferFromCompaniesFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(transferFromCompaniesFn.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(transferFromCompaniesFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      })
      // Get company store
      .addCase(getStoreByCompanyFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStoreByCompanyFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.companyStore = action.payload;
      })
      .addCase(getStoreByCompanyFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
        state.companyStore = null;
      })
      // Get transfers to company
      .addCase(getTransfersToCompanyFn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTransfersToCompanyFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transfersToCompany = action.payload.data || action.payload || [];
      })
      .addCase(getTransfersToCompanyFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
        state.transfersToCompany = [];
      });
  }
});

export const { resetWarehouse } = WarehouseSlice.actions;
export default WarehouseSlice;

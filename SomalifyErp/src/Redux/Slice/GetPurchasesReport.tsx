import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";





interface Purchase {
    purchase_id: number;
    purchase_qty: number;
    item_cost: string;
    purchase_discount: string;
    paid_amount: string;
    purchase_debt: string;
    expiry_date: string;
    manufacture_date: string;
    vendor_id: number;
    product_id: number;
    created_at: string;
    updated_at: string;
    product_sales?: any[]; // Add this if needed
  }
  
  export interface DataRespond {
    product_id: number;
    product_code: string;
    product_name: string;
    product_cost: string;
    product_price: string;
    product_alert_number: number;
    company_id: string;
    created_at: string;
    updated_at: string;
    product_purchases: Purchase[];
  }
  
  // Update PurchasesResponse interface
  export interface PurchasesResponse {
    data: DataRespond[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }
  
  // Update initial state
  const initialState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    data: [] as DataRespond[], // Changed to DataRespond array
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false
  };


// Update the interface
interface dataDate {
    startDate: string;
    endDate: string;
    page?: number;
    pageSize?: number;
    company_id?: string;
  }
  
  // Update initial state
 
  
  // Update async thunk
  export const getAllPurchasesReportFn = createAsyncThunk(
    'getAllPurchases',
    async (Data: dataDate, { rejectWithValue }) => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const compnay_Id = Data.company_id || userInfo.user?.company_id || userInfo.company_id;
        if (!compnay_Id) {
          return rejectWithValue("Company ID is required");
        }
        const res = await axios.get(
          `${Url}/reports/purchases?company_id=${compnay_Id}` + 
          `&start_date=${Data.startDate}&end_date=${Data.endDate}` +
          `&page=${Data.page || 1}&pageSize=${Data.pageSize || 20}`, 
          {
            withCredentials: true, // Cookies sent automatically
          }
        )
        return res.data
      } catch (error) {
        if (error instanceof AxiosError)
          return rejectWithValue(error.response?.data.message || errorMsg);
        return rejectWithValue(errorMsg);
      }
    }
  )
  
  // Update slice
  export const GetAllPurchasesSlice = createSlice({
    name: 'getallPurchases',
    reducers: {
      resteAllPurchases: () => initialState,
      setPagination: (state, action) => {
        state.page = action.payload.page
        state.pageSize = action.payload.pageSize
      }
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(getAllPurchasesReportFn.pending, (state) => ({
        ...state,
        isLoading: true
      }));
      builder.addCase(getAllPurchasesReportFn.fulfilled, (state, action) => ({
        ...state,
        isLoading: false,
        isSuccess: true,
        data: action.payload.data,
        total: action.payload.total,
        page: action.payload.page,
        pageSize: action.payload.pageSize,
        totalPages: Math.ceil(action.payload.total / action.payload.pageSize)
      }));
      builder.addCase(getAllPurchasesReportFn.rejected, (state, action) => ({
        ...state,
        isLoading: false,
        isError: true,
        errorMsg: String(action.payload),
      }));
    }
  })
  
  export const { resteAllPurchases, setPagination } = GetAllPurchasesSlice.actions
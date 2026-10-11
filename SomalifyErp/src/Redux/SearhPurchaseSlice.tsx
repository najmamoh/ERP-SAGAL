
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";


export interface PurchaseData{
  purchase_id:number
  purchase_qty:number
  item_cost:string
  purchase_discount:string
  paid_amount:string
  purchase_debt:string
  expiry_date:string
  manufacture_date:string
  vendor_id:number
  product_id:number
  created_at:string
  updated_at:string
  products:{
    product_id:number
    product_code:string
    product_name:string
    product_cost:string
    product_price:string
    product_alert_number:number
    company_id:string
    created_at:string
    updated_at:string
  }

}
export interface PurchasesResponse {
    data: PurchaseData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  interface PurchaseParams {
    page: number;
    pageSize: number;
    search?: string;
    company_id?: string;
  }
  
  const initialState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    data: [] as PurchaseData[],
    total: 0,
    page: 1,
    pageSize: 20,
    search: ''
  };
  
  export const SearchAllPurchasesSortFn = createAsyncThunk(
    'SearchAllpurchases',
    async (params: PurchaseParams, { rejectWithValue }) => {
      try {
        const res = await axios.get<PurchasesResponse>(`${Url}/purchases/search`, {
          params: {
            page: params.page,
            pageSize: params.pageSize,
            search: params.search,
            ...(params.company_id && { company_id: params.company_id }),
          },
          withCredentials: true
        });
        return res.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          return rejectWithValue(error.response?.data.message || errorMsg);
        }
        return rejectWithValue(errorMsg);
      }
    }
  );
  
  export const SearchAllPurchaseSortSlice = createSlice({
    name: 'SearchAllpurchases',
    reducers: {
      resetSearchAllPurchaseSort: () => initialState,
      setSearch: (state, action) => { // Add search reducer
        state.search = action.payload;
      }
    },
    initialState,
    extraReducers(builder) {
      builder
        .addCase(SearchAllPurchasesSortFn.pending, (state) => {
          state.isLoading = true;
          state.isError = false;
          state.isSuccess = false;
        })
        .addCase(SearchAllPurchasesSortFn.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.data = action.payload.data;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;
          })
        .addCase(SearchAllPurchasesSortFn.rejected, (state, action) => ({
          ...state,
          isLoading: false,
          isError: true,
          errorMsg: String(action.payload),
        }));
    }
  });
  
  export const { resetSearchAllPurchaseSort, setSearch } = SearchAllPurchaseSortSlice.actions;
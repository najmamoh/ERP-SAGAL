import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";
// import { ifError } from "assert";
// import { resetRegisterState } from "./RegisterSlice";


// Update the productData interface (remove hasMore from here)
interface productData {
    product_id: number;
    product_code: string;
    product_name: string;
    product_cost: string;
    product_price: string;
    product_alert_number: number;
    created_at: string;
    updated_at: string;
  }
  
  // Update the initial state type
  interface ProductsState {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    errorMsg: string;
    data: productData[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    search?: string;
  }
  
  const initialState: ProductsState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false
  };
  
  
  // Update the async thunk parameters
  export const getAllProductsFn = createAsyncThunk(
    'products/getAll',
    async (params: { page: number; pageSize: number; search?: string }, { rejectWithValue }) => {
      try {
        const requestParams: Record<string, unknown> = {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
        };

        const res = await axios.get(`${Url}/products`, {
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

  export const GetAllProductSlice = createSlice({
    name: 'getallProduct',
    reducers: {
      resteAllProduct: () => initialState,
      setPage: (state, action) => {
        state.page = action.payload;
      }
    },
    initialState,
    extraReducers: (builder) => {
      builder
        .addCase(getAllProductsFn.pending, (state) => {
          state.isLoading = true;
          state.isError = false;
          state.isSuccess = false;
        })
        .addCase(getAllProductsFn.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.data = action.payload.data;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.pageSize = action.payload.pageSize;
          state.hasMore = action.payload.hasMore;
        })
        .addCase(getAllProductsFn.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.errorMsg = String(action.payload);
        });
    }
  });

export  const { resteAllProduct,setPage} = GetAllProductSlice.actions
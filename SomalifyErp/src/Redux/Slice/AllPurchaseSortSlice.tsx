
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

const initialState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    data: [] as PurchaseData[],
    total: 0,
    page: 1,
    pageSize: 20
  };

export const getAllPurchasesSortFn = createAsyncThunk(
  'getAllpurchases',
  async (params: { page: number; pageSize: number; company_id?: string; search?: string }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${Url}/purchases`, {
        params: {
            page: params.page,
            pageSize: params.pageSize,
            ...(params.company_id && { company_id: params.company_id }),
            ...(params.search && params.search.trim() && { search: params.search.trim() }),
          },
        withCredentials: true,
      });
      console.log('API Response:', res.data); // Log the response data
      return res.data;
    } catch (error) {
      console.error('API Error:', error); // Log any errors
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data.message || errorMsg);
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const GetAllPurchaseSortSlice = createSlice({
  name: 'getallPurchase',
  reducers: {
    resetAllPurchaseSort : () => initialState,
  },
  initialState,
  extraReducers(builder){
    builder.addCase(getAllPurchasesSortFn.pending,()=>({
        ...initialState,
        isLoading:true
    }));
    builder.addCase(getAllPurchasesSortFn.fulfilled,(_,action)=>({
        ...initialState,
        isSuccess:true,
        data: action.payload.data,
        total: action.payload.total,
        page: action.payload.page,
        pageSize: action.payload.pageSize

    }));
    builder.addCase(getAllPurchasesSortFn.rejected,(_,action)=>({
        ...initialState,
        isError:true,
        errorMsg:String(action.payload),
    }));
}
});

export const { resetAllPurchaseSort } = GetAllPurchaseSortSlice.actions;


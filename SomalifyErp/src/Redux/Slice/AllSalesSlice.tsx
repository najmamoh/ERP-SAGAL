import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";

interface SaleDta{
    sale_id:number;
    sale_qty: number;
    item_price: string;
    sale_discount: string;
    received_amount: string;
    purchase_id: number;
    customer_id:number ;
    taxable_sale?: boolean;
    created_at:string;
    updated_at:string;
}




const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as SaleDta[],
    total: 0,
    page: 1,
    pageSize: 20
};
export const getAllSaleListFn = createAsyncThunk(
    'AllSales',
    async (params: { page: number; pageSize: number; company_id?: string; search?: string }, { rejectWithValue }) => {
        try {
          const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
          const headers: Record<string, string> = {};
          if (userInfo.accessToken) headers.Authorization = `Bearer ${userInfo.accessToken}`;

          const res = await axios.get(`${Url}/sales`, {
            params: {
              page: params.page,
              pageSize: params.pageSize,
              ...(params.company_id && { company_id: params.company_id }),
              ...(params.search && params.search.trim() && { search: params.search.trim() })
            },
            headers,
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
  

export const GetAllSalesSlice = createSlice({
    name: 'getallSales',
    reducers: {
      resetAllSales: () => initialState,
      setPage: (state, action) => {
        state.page = action.payload;
      }
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(getAllSaleListFn.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      });
      builder.addCase(getAllSaleListFn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.data = action.payload?.data ?? [];
        state.total = action.payload?.total ?? 0;
        state.page = action.payload?.page ?? 1;
        state.pageSize = action.payload?.pageSize ?? 20;
      });
      builder.addCase(getAllSaleListFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
    }
  });
  
  export const { resetAllSales, setPage } = GetAllSalesSlice.actions;
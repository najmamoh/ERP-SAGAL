import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";


// Update the interface and response type
interface PurchaseData {
  product_id: number
  product_code: string
  product_name: string
  total_stock: string
  product_price: string
  product_alert_number: number
}

interface PurchaseApiResponse {
  lowStockProducts: PurchaseData[]
  total: number
  page: number
  pageSize: number
}

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  data: {} as PurchaseApiResponse, // Update this to match API response structure
  total: 0,
  page: 1,
  pageSize: 20
};

export const getAllPurchasesAlertFn = createAsyncThunk(
  'AlertItem',
  async (params: { page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      // const company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;

      const res = await axios.get(`${Url}/purchases/AllItem`, {
        params: {
            page: params.page,
            pageSize: params.pageSize
          },
        withCredentials: true,
      });
       // Log the response data
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

export const GetAllPurchaseSAlertlice = createSlice({
  name: 'AlertItem',
  reducers: {
    resetAllPurchaseAlert : () => initialState,
    setPage: (state, action) => {
        state.page = action.payload;
      }
  },
  initialState,
  extraReducers(builder){
    builder.addCase(getAllPurchasesAlertFn.pending,()=>({
        ...initialState,
        isLoading:true
    }));
    builder.addCase(getAllPurchasesAlertFn.fulfilled,(_,action)=>({
        ...initialState,
        isSuccess:true,
        data:action.payload,
        total: action.payload.total,
        page: action.payload.page,
        pageSize: action.payload.pageSize

    }));
    builder.addCase(getAllPurchasesAlertFn.rejected,(_,action)=>({
        ...initialState,
        isError:true,
        errorMsg:String(action.payload),
    }));
}
});

export const { resetAllPurchaseAlert,setPage } = GetAllPurchaseSAlertlice.actions;


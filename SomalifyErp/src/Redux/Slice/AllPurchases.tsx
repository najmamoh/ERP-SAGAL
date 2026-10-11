import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";


interface PurchaseData{
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
const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMsg: '',
  data:[] as PurchaseData[],
};

export const getAllPurchasesFn = createAsyncThunk(
  'AllPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const company_Id = JSON.parse(localStorage.getItem("userInfo")!).company_id;

      const res = await axios.get(`${Url}/purchases/All?company_id=${company_Id}`, {
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

export const GetAllPurchaseSlice = createSlice({
  name: 'AllPurchases',
  reducers: {
    resetAllPurchase : () => initialState,
  },
  initialState,
  extraReducers(builder){
    builder.addCase(getAllPurchasesFn.pending,()=>({
        ...initialState,
        isLoading:true
    }));
    builder.addCase(getAllPurchasesFn.fulfilled,(_,action)=>({
        ...initialState,
        isSuccess:true,
        data:action.payload,

    }));
    builder.addCase(getAllPurchasesFn.rejected,(_,action)=>({
        ...initialState,
        isError:true,
        errorMsg:String(action.payload),
    }));
}
});

export const { resetAllPurchase } = GetAllPurchaseSlice.actions;


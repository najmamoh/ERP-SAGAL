import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


export interface PayAbleData {
  vendor_name: string;
  vendor_phone: string | number;
  vendor_address: string;
  product_code: string;
  product_name: string;
  purchase_id: number;
  purchase_qty: number;
  item_cost: string | number;
  paid_amount: string | number;
  purchase_discount: string | number;
  total_cost: string | number;
  total_paid_and_discount: string | number;
  debt: string | number;
  created_at: string;
  company_id?: number | null;
}




const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as PayAbleData[],
};
export const getAllPayableFn = createAsyncThunk(
    'getAllPayable',
    async (_companyId: string | undefined, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${Url}/payables/products`, {
                withCredentials: true,
            });

            return res.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.data?.message) {
                    return rejectWithValue(error.response.data.message);
                }
                if (error.code === 'ERR_NETWORK' || !error.response) {
                    return rejectWithValue('Cannot connect to server. Make sure the backend is running.');
                }
                return rejectWithValue(error.response?.statusText || error.message || errorMsg);
            }
            return rejectWithValue(errorMsg);
        }
    }
);

export const GetAllPayableSlice = createSlice({
    name:'getallPayable',
    reducers:{
        resetAllPayable :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getAllPayableFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getAllPayableFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getAllPayableFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllPayable} = GetAllPayableSlice.actions
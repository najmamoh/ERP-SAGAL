import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";
// import { ifError } from "assert";
// import { resetRegisterState } from "./RegisterSlice";


interface purchasedata{
    purchase_id: number,
    purchase_qty: number,
    item_cost: string,
    purchase_discount: string,
    paid_amount: string,
    purchase_debt: string,
    expiry_date: string,
    manufacture_date: string,
    vendor_id: number,
    product_id: number,
    created_at: string,
    updated_at: string,
    products: {
        product_id: number,
        product_code: string,
        product_name: string,
        product_cost: string,
        product_price: string,
        product_alert_number: number,
        company_id: string,
        created_at: string,
        updated_at: string
    }
    


   
}


const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as purchasedata,
};
export const getOnePurchaseFn= createAsyncThunk(
    'getOnePurchase',
    async(pruchase_id: number,{rejectWithValue})=>{
        try {
            // const compnay_Id =JSON.parse(localStorage.getItem("userInfo")!).company_id

            const res= await axios.get(`${Url}/purchases/${pruchase_id}`,{
                withCredentials: true,
              })

              return res.data
        } catch (error) {

            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
              return rejectWithValue(errorMsg); 
            
        }
    }
)

export const GetOnePurchaseSlice = createSlice({
    name:'getOneVendor',
    reducers:{
        resetOnePurchase :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOnePurchaseFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOnePurchaseFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOnePurchaseFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOnePurchase} = GetOnePurchaseSlice.actions
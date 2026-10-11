import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface vendorData{
    sale_id:number
    sale_qty: number;
    item_price: string;
    sale_discount: string;
    received_amount: string;
    purchase_id: number;
    customer_id:number ;
    taxable_sale?: boolean;
    created_at:string;
    updated_at:string;
    product_purchases:{
        products:{
            product_name:string
        }
    },
    customers:{
     customer_id: number,
        customer_name: string,
        customer_address:string,
        customer_phone: string,
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
    data:{} as vendorData,
};
export const getOneSaleFn= createAsyncThunk(
    'getOneSale',
    async(sale_id: number,{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const token = userInfo.accessToken;
            const res= await axios.get(`${Url}/sales/${sale_id}`,{
                headers: token ? { Authorization: `Bearer ${token}` } : {},
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

export const GetOneSaleSlice = createSlice({
    name:'getOneSale',
    reducers:{
        resetOneSale :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneSaleFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneSaleFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneSaleFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneSale} = GetOneSaleSlice.actions
import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";




interface ProductF{
    product_id: number,
    product_code:string,
    product_name: string,
    product_cost:string,
    product_price: string,
    product_alert_number: number,
    company_id: string,
    category?: string,
    description?: string,
    created_at: string,
    updated_at: string
    companies:{
        company_id: string,
        company_name: string,
        company_address: string,
        company_phone: string,
        company_email: string,
        subscribtion_fee: string,
        taxable: boolean,
        tax_percentage: number,
        created_at: string,
        updated_at: string,
        created_by: number
    }
}

const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as ProductF,
};
export const getOneProductFN= createAsyncThunk(
    'getOneproduct',
    async(vendor_id: number,{rejectWithValue})=>{
        try {
            // const compnay_vendor_Id =JSON.parse(localStorage.getItem("userInfo")!).company_id

            const res= await axios.get(`${Url}/products/${vendor_id}`,{
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

export const GetOneProductSlice = createSlice({
    name:'getOneProduct',
    reducers:{
        resetOneProduct :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneProductFN.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneProductFN.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneProductFN.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneProduct} = GetOneProductSlice.actions


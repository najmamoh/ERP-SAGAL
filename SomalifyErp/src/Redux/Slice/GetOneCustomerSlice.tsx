import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface UserComData{
    customer_id: number,
    customer_name: string,
    customer_address: string,
    customer_phone: string,
    company_id: string,
    created_at: string,
    updated_at: string
}





const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as UserComData ,
};
export const getOneCustomerFn= createAsyncThunk(
    'getOneCustomer',
    async(customer_id: number,{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const token = userInfo.accessToken;
            const res= await axios.get(`${Url}/customers/${customer_id}`,{
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

export const GetOneCustomerSlice = createSlice({
    name:'getOneCustomer',
    reducers:{
        resetOneCustomer :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneCustomerFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneCustomerFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneCustomerFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneCustomer} = GetOneCustomerSlice.actions
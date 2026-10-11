import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


export interface OneExpensesData{
    expense_id:number
    item_name:string
    item_qty:number
    item_cost:string
    paid_amount:string
    date:string
    company_id:string
    created_at:string
    updated_at:string
  
}






const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as OneExpensesData,
};
export const getOneExpensesFn= createAsyncThunk(
    'getOneVendor',
    async(expense_id: number,{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const token = userInfo.accessToken;
            const res= await axios.get(`${Url}/otherexpenses/${expense_id}`,{
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

export const GetOneExpenseSlice = createSlice({
    name:'getOneExpeses',
    reducers:{
        resetOneexpenses :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneExpensesFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneExpensesFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneExpensesFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneexpenses} = GetOneExpenseSlice.actions
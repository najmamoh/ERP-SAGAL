import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface bankData{
    bank_id: number,
    bank_name: string,
    amount: string,
    created_at: string,
    updated_at: string,
    sale_id: number | null
}

const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as bankData,
};

export const getOneBankFn= createAsyncThunk(
    'getOneBank',
    async(bank_id: number,{rejectWithValue})=>{
        try {
            const token= JSON.parse(localStorage.getItem("userInfo")!).accessToken;
            const res= await axios.get(`${Url}/Banks/${bank_id}`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
              })

              return res.data
        } catch (error) {

            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
              return rejectWithValue(errorMsg); 
            
        }
    }
)

export const GetOneBankSlice = createSlice({
    name:'getOneBank',
    reducers:{
        resetOneBank :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneBankFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneBankFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneBankFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneBank} = GetOneBankSlice.actions

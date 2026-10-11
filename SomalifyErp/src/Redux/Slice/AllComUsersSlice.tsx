import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";

interface UsersDta{
    user_id:number
    full_name:string
    email:string
    password:string
    customer_phone:string
    role:string
    company_id:string
    created_at:string
    updated_at:string
}




const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as UsersDta[],
};
export const GetAllUserCompnyFN= createAsyncThunk(
    'AllUsers',
    async(_,{rejectWithValue})=>{
        try {
            const res= await axios.get(`${Url}/auth/All`,{
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

export const GetAllUserCompnaySLice = createSlice({
    name:'getallCustomer',
    reducers:{
        resetAllUsersCompnay :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(GetAllUserCompnyFN.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(GetAllUserCompnyFN.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(GetAllUserCompnyFN.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllUsersCompnay} = GetAllUserCompnaySLice.actions
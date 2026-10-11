import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface UserComData{
    user_id: number,
    full_name: string,
    password: string,
    email: string,
    role: string,
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
export const getOneUserComFn= createAsyncThunk(
    'getOneUsers',
    async(user_id: number,{rejectWithValue})=>{
        try {
            // const compnay_Id =JSON.parse(localStorage.getItem("userInfo")!).company_id

            const res= await axios.get(`${Url}/auth/getOne/${user_id}`,{
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

export const GetOneUserComSlice = createSlice({
    name:'getOneUsers',
    reducers:{
        resetOneUserCom :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneUserComFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneUserComFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneUserComFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneUserCom} = GetOneUserComSlice.actions
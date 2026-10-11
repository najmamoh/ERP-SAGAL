import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface OneEmploymentDta{
    employee_id:string
    employee_name: string,
    employee_address: string,
    employee_phone: string,
    salary_amount:string,
    company_id: string;
    created_at:string;
    updated_at:string;
}





const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as OneEmploymentDta,
};
export const getOneEmploymentFn= createAsyncThunk(
    'getOneemployes',
    async(employee_id: number,{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const token = userInfo.accessToken;
            const res= await axios.get(`${Url}/employees/${employee_id}`,{
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

export const GetOneEmployeesSlice = createSlice({
    name:'getOneEmployees',
    reducers:{
        resetOneEmployees :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneEmploymentFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneEmploymentFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneEmploymentFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneEmployees} = GetOneEmployeesSlice.actions
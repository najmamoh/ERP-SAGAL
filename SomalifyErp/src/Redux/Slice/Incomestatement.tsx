import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface IncomeData{
  salesInfo: [ 
        {
          total_sales: string,
          cash_sales: string,
          total_sales_cost: string
          } ],
      salaryExpenses: [
        {
          total_salaries_expenses:string
        }
      ],
      otherExpenses: [
        {
          total_other_expenses: string
        }
      ]
    
}


const initialState={
    isLoading:false,
    isSuccess:false,
    isError:false,
    errorMsg:'',
    data:{} as IncomeData,
}

export const GetIncomeFn= createAsyncThunk(
    'GetAllIncoome',
    async(_,{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const compnay_Id = userInfo.user?.company_id || userInfo.company_id;
            if (!compnay_Id) {
                return rejectWithValue("Company ID is required");
            }
            const currentDate = new Date(); // Initialize the currentDate variable
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        currentDate.getDate()
      ).toISOString().slice(0, 10); // Calculate the start date in the correct format
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ).toISOString().slice(0, 10); // Calculate the end date in the correct format

      const token = userInfo.accessToken;
      const res = await axios.get(
        `${Url}/reports/incomestatement?company_id=${compnay_Id}&start_date=${startDate}&end_date=${endDate}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );
              console.log("Income",res)
              console.log("startdate",startDate)
          
              return res.data
              
        } catch (error) {
            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
              return rejectWithValue(errorMsg); 
        }
    }
)


export const GetAllIncomeSlice = createSlice({
    name:'getallincome',
    reducers:{
        resetAllIncome :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(GetIncomeFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(GetIncomeFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(GetIncomeFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllIncome} = GetAllIncomeSlice.actions
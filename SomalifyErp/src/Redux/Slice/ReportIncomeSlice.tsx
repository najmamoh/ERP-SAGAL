import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface dataDate{
    startDate:string,
    endDate:string,
    company_id?:string

}


interface IncomeReportData {
    totalSales: string;
    neededAmount: string;
    /** Cash collected on product sales in period */
    cashReceivedFromSales?: string;
    /** Unpaid balance on those sales (still owed) */
    balanceDueOnSales?: string;
    costOfGoodsSold: string;
    netSale: string;
    salaryExpenses: string;
    otherExpenses: string;
    /** Other expenses paid_amount sum in period */
    otherExpensesPaid?: string;
    /** Other expenses still unpaid (total − paid) */
    otherExpensesUnpaid?: string;
    totalExpenses: string;
    /** Salary paid + other paid — used for net profit / loss */
    paidExpenses?: string;
    /** Net profit: net sale − paid expenses */
    income: string;
    /** Net profit (cash): cash received − COGS − paid expenses */
    incomeCash?: string;
  }

const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as IncomeReportData,
};
export const AllIncomeReportFn= createAsyncThunk(
    'getAllIncomeReport',
    async(Data:dataDate,{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const compnay_Id = Data.company_id || userInfo.user?.company_id || userInfo.company_id;
            const res= await axios.get(`${Url}/financial/profit-loss?company_id=${compnay_Id}&start_date=${Data.startDate}&end_date=${Data.endDate}`,{
                withCredentials: true, // Cookies sent automatically
              })

              return res.data
        } catch (error) {

            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
              return rejectWithValue(errorMsg); 
            
        }
    }
)

export const AllIncomeReportSlice = createSlice({
    name:'getallIncomeReport',
    reducers:{
        resteAllIncomeReport :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(AllIncomeReportFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(AllIncomeReportFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(AllIncomeReportFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resteAllIncomeReport} = AllIncomeReportSlice.actions
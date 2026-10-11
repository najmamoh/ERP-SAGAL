import { createAsyncThunk,createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


export interface AllExpensesData{
    
    expense_id:number
    item_name:string
    item_qty:number
    item_cost:string
    paid_amount:string
    date:string
    company_id:string
    created_at:string
    updated_at:string
    companies?: {
        company_name: string;
        company_id: string;
    } | null
    
}

export interface OtherExpensesResponse {
    otherExpenses: AllExpensesData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  interface AllExpensesState {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    errorMsg: string;
    data: AllExpensesData[];  // ← just the array
    total: number;
    page: number;
    pageSize: number;
  }



const initialState: AllExpensesState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] ,
    total: 0,
    page: 1,
    pageSize: 20
};
export const getAllExpensesOnlyFn= createAsyncThunk<
OtherExpensesResponse,                 // ← the full response shape
{ page: number; pageSize: number; company_id?: string; startDate?: string; endDate?: string },   // ← thunk args
{ rejectValue: string }
>(
    'getAllsalaries',
    async(params,{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo")!);
            const token = userInfo.accessToken ?? userInfo.token;

            const userCompanyId = userInfo.user?.company_id ?? userInfo.company_id;
            
            // For superAdmin, use provided company_id or undefined (all companies)
            // For regular users, always use their company_id
            const roles = userInfo.user?.roles || userInfo.roles || [];
            const isSuperAdmin = roles.includes('superAdmin') || roles.includes('super_admin');
            const companyId = isSuperAdmin 
                ? (params.company_id || undefined)
                : userCompanyId;
            
            const res= await axios.get(`${Url}/otherexpenses`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    page: params.page,
                    pageSize: params.pageSize,
                    ...(companyId && { company_id: companyId }),
                    ...(params.startDate && { startDate: params.startDate }),
                    ...(params.endDate && { endDate: params.endDate })
                  },withCredentials: true,
              })

              return res.data
        } catch (error) {

            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
              return rejectWithValue(errorMsg); 
            
        }
    }
)

export const GetAllExpensesOnlySlice = createSlice({
    name:'getallOrder',
    reducers:{
        resetAllExpenses :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getAllExpensesOnlyFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getAllExpensesOnlyFn.fulfilled,(state, action: PayloadAction<OtherExpensesResponse | any>) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.data = action.payload.otherExpenses ?? action.payload.data ?? [];
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;

        });
        builder.addCase(getAllExpensesOnlyFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllExpenses} = GetAllExpensesOnlySlice.actions
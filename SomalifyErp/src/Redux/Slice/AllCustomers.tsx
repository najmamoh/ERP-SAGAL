import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";

interface CustomerDta{
    customer_id:number
    customer_name:string
    customer_address:string
    customer_phone:string
    company_id:string
    created_at:string
    updated_at:string
}

export interface CustomerResponse {
    data: CustomerDta[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  interface PurchaseParams {
    page: number;
    pageSize: number;
    search?: string;
  }


const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as CustomerDta[],
    total: 0,
    page: 1,
    pageSize: 20,
    search: ''
};
export const getAllCustomerFn= createAsyncThunk(
    'AllCustomer',
    async(params:PurchaseParams & { company_id?: string },{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const isAdminDashboard = window.location.pathname.startsWith('/AdminDashboard');
            const roles = userInfo.user?.roles || userInfo.roles || [];
            const isMainAdmin = isAdminDashboard && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));
            
            // For admin users, company_id is optional (can be passed as parameter)
            // For normal users, get company_id from userInfo
            const compnay_Id = params.company_id || userInfo.company_id || userInfo.user?.company_id;
            
            // Admin users don't need company_id - they can view all customers
            // Normal users must have company_id
            if (!isMainAdmin && !compnay_Id) {
                return rejectWithValue("Company not found");
            }

            const headers: Record<string, string> = {};
            if (userInfo.accessToken) headers.Authorization = `Bearer ${userInfo.accessToken}`;

            const requestParams: any = {
                page: params.page,
                pageSize: params.pageSize,
                search: params.search
            };
            
            // Only add company_id if it exists (for admin users, it's optional)
            if (compnay_Id) {
                requestParams.company_id = compnay_Id;
            }

            const res= await axios.get<CustomerResponse>(`${Url}/customers`,{
                headers,
                withCredentials: true,
                params: requestParams
            })

            return res.data
        } catch (error) {
            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
            return rejectWithValue(errorMsg); 
        }
    }
)

export const GetAllCustomerSlice = createSlice({
    name:'getallCustomer',
    reducers:{
        resetAllCustomer :()=> initialState,
        setSearch: (state, action) => { // Add search reducer
            state.search = action.payload;
          }
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getAllCustomerFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getAllCustomerFn.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.data = action.payload.data;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;

        });
        builder.addCase(getAllCustomerFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllCustomer,setSearch} = GetAllCustomerSlice.actions
import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


export interface employeeData{
    employee_id:number
    employee_name:string
    employee_address:string
    employee_phone:string
    salary_amount:string
    company_id:string
    created_at:string
    updated_at:string
}



const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as employeeData[],
};
export const getAllEmployersFn= createAsyncThunk<
    employeeData[],
    string | { companyId?: string; search?: string } | undefined
>(
    'getAllEmployer',
    async(arg,{rejectWithValue})=>{
        try {
            const companyId = typeof arg === 'string' ? arg : arg?.companyId;
            const search = typeof arg === 'object' && arg ? arg.search : undefined;
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
            const isAdminDashboard = window.location.pathname.startsWith('/AdminDashboard');
            const roles = userInfo.user?.roles || userInfo.roles || [];
            const isMainAdmin = isAdminDashboard && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));
            const compnay_Id = companyId || userInfo.user?.company_id || userInfo.company_id;

            // Admin users don't need company_id - they can view all employees
            // Normal users must have company_id
            if (!isMainAdmin && !compnay_Id) {
                return rejectWithValue('Company not found.');
            }

            // For admin users, don't require company_id in query (backend handles it)
            const requestParams: any = {};
            if (compnay_Id) {
                requestParams.company_id = compnay_Id;
            }
            if (search && search.trim()) {
                requestParams.search = search.trim();
            }

            const res= await axios.get(`${Url}/employees`,{
                params: requestParams,
                withCredentials: true,
              })

              return res.data
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.data?.message) {
                    return rejectWithValue(error.response.data.message);
                }
                if (error.code === 'ERR_NETWORK' || !error.response) {
                    return rejectWithValue('Cannot connect to server. Make sure the backend is running on port 8181.');
                }
                return rejectWithValue(error.response?.statusText || error.message || errorMsg);
            }
            return rejectWithValue(errorMsg);
        }
    }
)

export const GetAllEmployeesSlice = createSlice({
    name:'getallOrder',
    reducers:{
        resetAllEmployess :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getAllEmployersFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getAllEmployersFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getAllEmployersFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllEmployess} = GetAllEmployeesSlice.actions
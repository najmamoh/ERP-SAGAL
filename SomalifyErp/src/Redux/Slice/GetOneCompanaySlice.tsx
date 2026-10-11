import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";
// import { ifError } from "assert";
// import { resetRegisterState } from "./RegisterSlice";



interface CompanyData{
    company_id: string,
    company_name:string,
    company_address: string,
    company_phone:string,
    company_email:string,
    subscribtion_fee: string,
    taxable: boolean,
    tax_percentage: number,
    created_at: string,
    updated_at: string
}

const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as CompanyData ,
};
export const getOneCompanayFN= createAsyncThunk(
    'getOneCompany',
    async(companyId: string | undefined = undefined,{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
            const isAdminDashboard = window.location.pathname.startsWith('/AdminDashboard');
            const roles = userInfo.user?.roles || userInfo.roles || [];
            const isMainAdmin = isAdminDashboard && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));
            
            // For admin users, company_id is optional (can be passed as parameter)
            // For normal users, get company_id from userInfo
            const company_id = companyId || userInfo.user?.company_id || userInfo.company_id;
            
            // Admin users don't need company_id - they can view any company
            // Normal users must have company_id
            if (!isMainAdmin && !company_id) {
                return rejectWithValue('Company not found in user session.');
            }

            // If admin user and no company_id provided, return empty/null (they should select a company)
            if (isMainAdmin && !company_id) {
                return { company_id: null, company_name: null } as any; // Return empty company for admin
            }

            const res= await axios.get(`${Url}/companies/${company_id}`,{
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

export const GetOneCompanySlice = createSlice({
    name:'getOneCompanay',
    reducers:{
        resetOneCompnay :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneCompanayFN.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneCompanayFN.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneCompanayFN.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneCompnay} = GetOneCompanySlice.actions


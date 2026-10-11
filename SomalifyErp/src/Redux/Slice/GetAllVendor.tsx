import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface VendorData{
    vendor_id:number
    vendor_name:string
    vendor_address:string
    vendor_email:string
    vendor_phone:string
    company_id:string | null
    created_at:string
    updated_at:string
}



// interface VendorsState {
//     isLoading: boolean;
//     isError: boolean;
//     isSuccess: boolean;
//     errorMsg: string;
//     data: VendorData[];
//     total: number;
//     page: number;
//     pageSize: number;
//     hasMore: boolean;
//     search?: string;
//   }


const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as VendorData[],
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false
};
export const getAllVendorsFn= createAsyncThunk(
    'getAllVendor',
    async(params: { page: number; pageSize: number; search?: string; company_id?: string },{rejectWithValue})=>{
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
            
            // For admin users, company_id is optional (can be passed as parameter)
            // For normal users, get company_id from userInfo
            const company_id = params.company_id || userInfo.user?.company_id || userInfo.company_id;
            
            // Admin users don't need company_id - they can view all vendors
            // Normal users must have company_id (handled by backend)
            
            const requestParams: any = {
                page: params.page,
                pageSize: params.pageSize,
                search: params.search
            };
            
            // Only add company_id if it exists (for admin users, it's optional)
            if (company_id) {
                requestParams.company_id = company_id;
            }

            const res= await axios.get(`${Url}/vendors`,{
                params: requestParams,
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

export const GetAllVendorSlice = createSlice({
    name:'getallOrder',
    reducers:{
        resetAllVendor :()=> initialState,
        setPage: (state, action) => {
            state.page = action.payload;
          }
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getAllVendorsFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getAllVendorsFn.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.data = action.payload.data;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pageSize = action.payload.pageSize;
            state.hasMore = action.payload.hasMore;

        });
        builder.addCase(getAllVendorsFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllVendor,setPage} = GetAllVendorSlice.actions
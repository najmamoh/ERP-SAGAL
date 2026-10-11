import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";

interface BankData{
    bank_id:number
    bank_name:string
    amount:string
    created_at:string
    updated_at:string
    sale_id:number | null
}

const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as BankData[],
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false
};

export const getAllBanksFn= createAsyncThunk(
    'getAllBanks',
    async(params: { page: number; pageSize: number; search?: string },{rejectWithValue})=>{
        try {
            const userInfo= JSON.parse(localStorage.getItem("userInfo")!)
            const company_id =userInfo.company_id
            const token= JSON.parse(localStorage.getItem("userInfo")!).accessToken;
            const res = await axios.get(`${Url}/Banks`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
                params: {
                    company_id,
                    page: params.page,
                    pageSize: params.pageSize,
                    search: params.search
                }
            });
            return res.data;
        } catch (error) {

            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
              return rejectWithValue(errorMsg); 
            
        }
    }
)

export const GetAllBanksSlice = createSlice({
    name:'getAllBanks',
    reducers:{
        resetAllBanks :()=> initialState,
        setPage: (state, action) => {
            state.page = action.payload;
          }
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getAllBanksFn.pending,(state)=>({
            ...state,
            isLoading:true,
            isError: false,
            errorMsg: ''
        }));
        builder.addCase(getAllBanksFn.fulfilled,(state,action)=>{
            console.log('Banks fulfilled payload:', action.payload);
            state.isLoading = false;
            state.isSuccess = true;
            // Handle both array response and wrapped response
            if (Array.isArray(action.payload)) {
                state.data = action.payload;
                state.total = action.payload.length;
            } else {
                state.data = action.payload?.data || action.payload?.banks || [];
                state.total = action.payload?.total || action.payload?.count || 0;
                state.page = action.payload?.page || 1;
                state.pageSize = action.payload?.pageSize || 20;
                state.hasMore = action.payload?.hasMore || false;
            }
        });
        builder.addCase(getAllBanksFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllBanks,setPage} = GetAllBanksSlice.actions

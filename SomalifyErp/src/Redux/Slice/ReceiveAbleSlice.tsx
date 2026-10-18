import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { Url, errorMsg } from "@/Interfaces";
import { getCookie } from "@/lib/cookies";


interface ReceiveData{
        customer_name: string,
        customer_phone: string,
        customer_address: string,
        product_code: string,
        product_name: string,
        sale_id: number,
        sale_qty: number,
        item_price: string,
        received_amount: string,
        sale_discount:string,
        total_price: string,
        total_paid_and_discount: string,
        credit: string,
        sale_date: string
}






const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as ReceiveData[],
    total: 0,
    page: 1,
    pageSize: 20,
    summary: null as { totalSales: number; totalReceived: number; totalDebt: number } | null,
};
export const getAllReceiveAbleFn= createAsyncThunk(
    'getAllPayable',
    async (params: { page: number; pageSize: number; company_id?: string; search?: string }, { rejectWithValue }) => {
        try {
            const raw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
            const userInfo = raw ? JSON.parse(raw) : {};
            // For admin users, company_id is optional (can be passed as parameter)
            // For normal users, get company_id from userInfo
            const company_Id = params.company_id || (userInfo.user?.company_id ?? userInfo.company_id);
            
            // Admin users don't need company_id - they can view all receivables
            // Normal users must have company_id (handled by backend)
            
            const token = userInfo.accessToken;
            const requestParams: any = {
                page: params.page,
                pageSize: params.pageSize
            };
            // Company dashboard: backend uses company_id from token. Admin: pass selected company_id so backend filters.
            if (company_Id) {
                requestParams.company_id = company_Id;
            }
            if (params.search && params.search.trim()) {
                requestParams.search = params.search.trim();
            }

            const res = await axios.get(`${Url}/receivables/products`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
                params: requestParams
              });
            return res.data;
        } catch (error) {
            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
            return rejectWithValue(errorMsg); 
        }
    }
)


export const GetAllRecieveAbleSlice = createSlice({
    name:'getallReceive',
    reducers:{
        resetAllRecieve :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getAllReceiveAbleFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getAllReceiveAbleFn.fulfilled,(_,action)=>{
            const payload = action.payload as any;
            const data = Array.isArray(payload) ? payload : (payload?.data ?? []);
            return {
            ...initialState,
            isSuccess:true,
            data,
            total: payload?.total ?? (Array.isArray(payload) ? payload.length : 0),
            page: payload?.page ?? 1,
            pageSize: payload?.pageSize ?? 20,
            summary: payload?.summary ?? null,
        };
        });
        builder.addCase(getAllReceiveAbleFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetAllRecieve} = GetAllRecieveAbleSlice.actions
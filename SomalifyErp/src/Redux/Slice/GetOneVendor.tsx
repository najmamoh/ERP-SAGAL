import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";


interface vendorData{
    vendor_id: number,
    vendor_name: string,
    vendor_address: string,
    vendor_email: string,
    vendor_phone: string,
    company_id: string,
    created_at: string,
    updated_at: string
}





const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as vendorData,
};
export const getOneVendorFn= createAsyncThunk(
    'getOneVendor',
    async(vendor_id: number,{rejectWithValue})=>{
        try {
            // const compnay_Id =JSON.parse(localStorage.getItem("userInfo")!).company_id

            const res= await axios.get(`${Url}/vendors/${vendor_id}`,{
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

export const GetOneVendorSlice = createSlice({
    name:'getOneVendor',
    reducers:{
        resetOneVendor :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneVendorFn.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneVendorFn.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneVendorFn.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneVendor} = GetOneVendorSlice.actions
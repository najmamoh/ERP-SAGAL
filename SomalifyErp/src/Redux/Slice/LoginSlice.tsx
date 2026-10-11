import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios, {AxiosError} from 'axios'
import {Url, errorMsg} from '../../Interfaces'


interface UserLoginData {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'user'|'superAdmin';
    company_id: string;
  };
  accessToken?: string;
  refreshToken: string;
  refreshTokenExpiry?: string;
  accessTokenExpiry?: string;
}


const initialState={
    data:{} as UserLoginData,
    Isloading:false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
};

export const LoginFn = createAsyncThunk(
    'user/login',
    async(data:any,{rejectWithValue})=>{
        try {
            const res = await axios.post(`${Url}/auth/signin`,data,{withCredentials: true,});
            return res.data;
        } catch (error) {
            if (error instanceof AxiosError)
        return rejectWithValue(error.response?.data.message || errorMsg)
        return rejectWithValue(errorMsg)
        }
    }
);

export const AdminLoginFn = createAsyncThunk(
    'admin/login',
    async(data:any,{rejectWithValue})=>{
        try {
            const res = await axios.post(`${Url}/main/auth/signin`,data,{withCredentials: true});
            return res.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const msg = error.response?.data?.message;
                if (msg) return rejectWithValue(msg);
                if (!error.response) {
                    return rejectWithValue('Cannot reach server. Make sure the backend is running on port 8181.');
                }
                return rejectWithValue(errorMsg);
            }
            return rejectWithValue(errorMsg);
        }
    }
);

export const LoginSlice = createSlice({
     name:'login',
     reducers:{ reset:()=>initialState},
     initialState,
     extraReducers:(builder)=>{
        builder.addCase(LoginFn.pending,()=>({
            ...initialState,
            Isloading:true,
        }));
        
        builder.addCase(LoginFn.fulfilled,(_,action)=>({
            ...initialState,
            data: action.payload,
            isSuccess: true
         }));
       builder.addCase(LoginFn.rejected,(_,action)=>({
        ...initialState,
        isError:true,
        errorMsg: String(action.payload)
       }));
       
       // Admin login cases
       builder.addCase(AdminLoginFn.pending,()=>({
            ...initialState,
            Isloading:true,
        }));
        
        builder.addCase(AdminLoginFn.fulfilled,(_,action)=>({
            ...initialState,
            data: action.payload,
            isSuccess: true
         }));
       builder.addCase(AdminLoginFn.rejected,(_,action)=>({
        ...initialState,
        isError:true,
        errorMsg: String(action.payload)
       }))   
     }
})
export const {reset} =LoginSlice.actions
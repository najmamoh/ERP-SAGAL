import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "../../../Interfaces";



const initialState={
    isLoading:false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    
};

export const delEmployeeFn = createAsyncThunk(
    'Delete/employee',
    async (payload: { id: number; companyId?: string }, { rejectWithValue }) => {
      try {
        const { id, companyId } = typeof payload === 'number' ? { id: payload, companyId: undefined } : payload;
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
        const roles = userInfo.user?.roles || userInfo.roles || [];
        const isSuperAdmin = roles.includes('superAdmin') || roles.includes('super_admin');
        const qs = isSuperAdmin && companyId ? `?company_id=${companyId}` : '';
        const res = await axios.delete(`${Url}/employees/${id}${qs}`,{
          withCredentials: true,
        });
        return res.data.message;
      } catch (error) {
        if (error instanceof AxiosError) {
          return rejectWithValue(error.response?.data.message || errorMsg);
        }
  
        return rejectWithValue(errorMsg);
      }
    }
);

export const delEmployeesSlice = createSlice({
    name: 'DelVendor',
    reducers: {
      resetDelEmployees: () => initialState,
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(delEmployeeFn.pending, () => ({
        ...initialState,
        isLoading: true,
      }));
      builder.addCase(delEmployeeFn.fulfilled, (_, action) => ({
        ...initialState,
        isSuccess: true,
        message: String(action.payload),
      }));
      builder.addCase(delEmployeeFn.rejected, (_, action) => ({
        ...initialState,
        isError: true,
        errorMsg: String(action.payload),
      }));
    },
  });

  export const { resetDelEmployees } = delEmployeesSlice.actions
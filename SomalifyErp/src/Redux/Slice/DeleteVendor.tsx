import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "../../Interfaces";



const initialState={
    isLoading:false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    
};

export const delVendorFn = createAsyncThunk(
    'Delete/Vendor',
    async (id: number, { rejectWithValue }) => {
      try {

        const res = await axios.delete(`${Url}/vendors/${id}`,{
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

export const delVendorSlice = createSlice({
    name: 'DelVendor',
    reducers: {
      resetDelVendor: () => initialState,
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(delVendorFn.pending, () => ({
        ...initialState,
        isLoading: true,
      }));
      builder.addCase(delVendorFn.fulfilled, (_, action) => ({
        ...initialState,
        isSuccess: true,
        message: String(action.payload),
      }));
      builder.addCase(delVendorFn.rejected, (_, action) => ({
        ...initialState,
        isError: true,
        errorMsg: String(action.payload),
      }));
    },
  });

  export const { resetDelVendor } = delVendorSlice.actions
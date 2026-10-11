import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "../../Interfaces";



const initialState={
    isLoading:false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    
};

export const delUserFn = createAsyncThunk(
    'Delete/user',
    async (id: number, { rejectWithValue }) => {
      try {

        const res = await axios.delete(`${Url}/auth/${id}`,{
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

export const delUserSlice = createSlice({
    name: 'DelUser',
    reducers: {
      resetDelUser: () => initialState,
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(delUserFn.pending, () => ({
        ...initialState,
        isLoading: true,
      }));
      builder.addCase(delUserFn.fulfilled, (_, action) => ({
        ...initialState,
        isSuccess: true,
        message: String(action.payload),
      }));
      builder.addCase(delUserFn.rejected, (_, action) => ({
        ...initialState,
        isError: true,
        errorMsg: String(action.payload),
      }));
    },
  });

  export const { resetDelUser } = delUserSlice.actions
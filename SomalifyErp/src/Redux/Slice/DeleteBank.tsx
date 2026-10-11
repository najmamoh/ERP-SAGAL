import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "../../Interfaces";



const initialState={
    isLoading:false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    
};

export const delBankFn = createAsyncThunk(
    'Delete/Bank',
    async (id: number, { rejectWithValue }) => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo')!).accessToken;
        const res = await axios.delete(`${Url}/Banks/${id}`,{
          headers: {
              Authorization: `Bearer ${token}`,
          }
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

export const delBankSlice = createSlice({
    name: 'DelBank',
    reducers: {
      resetDelBank: () => initialState,
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(delBankFn.pending, () => ({
        ...initialState,
        isLoading: true,
      }));
      builder.addCase(delBankFn.fulfilled, (_, action) => ({
        ...initialState,
        isSuccess: true,
        message: String(action.payload),
      }));
      builder.addCase(delBankFn.rejected, (_, action) => ({
        ...initialState,
        isError: true,
        errorMsg: String(action.payload),
      }));
    },
  });

  export const { resetDelBank } = delBankSlice.actions

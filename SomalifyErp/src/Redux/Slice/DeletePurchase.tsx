import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "../../Interfaces";



const initialState={
    isLoading:false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    
};

export const delPurchaseFn = createAsyncThunk(
    'Delete/Sale',
    async (purchase_id: number, { rejectWithValue }) => {
      try {

        const res = await axios.delete(`${Url}/purchases/${purchase_id}`,{
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

export const delPurchaseSlice = createSlice({
    name: 'DelPurchase',
    reducers: {
      resetDelPurchase: () => initialState,
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(delPurchaseFn.pending, () => ({
        ...initialState,
        isLoading: true,
      }));
      builder.addCase(delPurchaseFn.fulfilled, (_, action) => ({
        ...initialState,
        isSuccess: true,
        message: String(action.payload),
      }));
      builder.addCase(delPurchaseFn.rejected, (_, action) => ({
        ...initialState,
        isError: true,
        errorMsg: String(action.payload),
      }));
    },
  });

  export const { resetDelPurchase } = delPurchaseSlice.actions
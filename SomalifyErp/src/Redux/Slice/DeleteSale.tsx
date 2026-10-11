import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "../../Interfaces";
import { getCookie } from "@/lib/cookies";

const initialState={
    isLoading:false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    
};

export const delSaleFn = createAsyncThunk(
    'Delete/Sale',
    async (sale_id: number, { rejectWithValue }) => {
      try {
        const raw = localStorage.getItem("userInfo") ?? getCookie("userInfo");
        const userInfo = raw ? JSON.parse(raw) : {};
        const token = userInfo.accessToken ?? userInfo.token;

        const res = await axios.delete(`${Url}/Sales/${sale_id}`,{
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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

export const delSaleSlice = createSlice({
    name: 'DelSale',
    reducers: {
      resetDelSale: () => initialState,
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(delSaleFn.pending, () => ({
        ...initialState,
        isLoading: true,
      }));
      builder.addCase(delSaleFn.fulfilled, (_, action) => ({
        ...initialState,
        isSuccess: true,
        message: String(action.payload),
      }));
      builder.addCase(delSaleFn.rejected, (_, action) => ({
        ...initialState,
        isError: true,
        errorMsg: String(action.payload),
      }));
    },
  });

  export const { resetDelSale } = delSaleSlice.actions
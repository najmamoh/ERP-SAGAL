import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "../../../Interfaces";



const initialState={
    isLoading:false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    
};

export const delExpensesFn = createAsyncThunk(
    'Delete/Expenses',
    async (id: number, { rejectWithValue }) => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const token = userInfo.accessToken;
        const res = await axios.delete(`${Url}/otherexpenses/${id}`,{
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

export const delExpensesSlice = createSlice({
    name: 'DelVendor',
    reducers: {
      resetExpensesDelete: () => initialState,
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(delExpensesFn.pending, () => ({
        ...initialState,
        isLoading: true,
      }));
      builder.addCase(delExpensesFn.fulfilled, (_, action) => ({
        ...initialState,
        isSuccess: true,
        message: String(action.payload),
      }));
      builder.addCase(delExpensesFn.rejected, (_, action) => ({
        ...initialState,
        isError: true,
        errorMsg: String(action.payload),
      }));
    },
  });

  export const { resetExpensesDelete } = delExpensesSlice.actions
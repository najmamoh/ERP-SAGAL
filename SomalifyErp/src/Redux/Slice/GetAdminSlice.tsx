import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, {AxiosError} from "axios"; 
import { Url, errorMsg } from '../../Interfaces';



// const initialState = {
//     isLoading: false,
//     isError: false,
//     isSuccess: false,
//     errorMsg: '',
//     data:[] ,
//   };


  export const getTypeFn = createAsyncThunk(
    'getType',
    async (_, { rejectWithValue }) => {
        try {
          const res = await axios.get(`${Url}/product/getAll`,{withCredentials: true,});
          return res.data;
        } catch (error) {
          if (error instanceof AxiosError)
            return rejectWithValue(error.response?.data.message || errorMsg);
    
          return rejectWithValue(errorMsg);
        }
      }
  );
import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axios,{AxiosError} from "axios";
import { Url,errorMsg } from "@/Interfaces";




interface Invoicedata{
        id: string;
        invoice_number: string;
        issue_date: string;
        due_date: string;
        status: string;
        total_amount: string;
        tax_amount: string;
        company_id: string;
        customer_id: number;
        created_at: string;
        updated_at: string;
        sale_id: number;
            items: [
                {
                    id: number;
            quantity: number;
            unit_price: string;
            discount: string;
            product_id: number;
            invoice_id: string;
            product: {
                product_id: number;
                product_code: string;
                product_name: string;
                product_cost: string;
                product_price: string;
                product_alert_number: number;
                company_id: string;
                created_at: string;
                updated_at: string;
            };
                    
                }
            ],
            customer: {
                customer_id: number;
                customer_name: string;
                customer_address: string;
                customer_phone: string;
                company_id: string;
                created_at: string;
                updated_at: string;
            },
            company: {
                company_id: string;
                company_name: string;
                company_address: string;
                company_phone: string;
                company_email: string;
                subscribtion_fee: string;
                taxable: boolean;
                tax_percentage: number;
                created_at: string;
                updated_at: string;
                created_by: number | null;
            }
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
}


const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:[] as Invoicedata[],
    total: 0,
    page: 1,
    pageSize: 20
};
export const getAllInvoiceFn = createAsyncThunk(
    'AllInvoice',
    async (params: { page: number; pageSize: number }, { rejectWithValue }) => {
        try {

          const res = await axios.get(`${Url}/invoice`, {
            params: {
              page: params.page,
              pageSize: params.pageSize
            },
            withCredentials: true,
          });
          return res.data;
      } catch (error) {
        if (error instanceof AxiosError)
          return rejectWithValue(error.response?.data.message || errorMsg);
        return rejectWithValue(errorMsg);
      }
    }
  );
  

export const GetAllInvoiceSlice = createSlice({
    name: 'AllInvoice',
    reducers: {
      resetAllInvoice: () => initialState,
      setPage: (state, action) => {
        state.page = action.payload;
      }
    },
    initialState,
    extraReducers(builder) {
      builder.addCase(getAllInvoiceFn.pending, (state) => {
        state.isLoading = true;
      });
      builder.addCase(getAllInvoiceFn.fulfilled, (state, action) => ({
        ...state,
        isSuccess: true,
        data: action.payload.data,
        total: action.payload.total,
        page: action.payload.page,
        pageSize: action.payload.pageSize
      }));
      builder.addCase(getAllInvoiceFn.rejected, (state, action) => {
        state.isError = true;
        state.errorMsg = String(action.payload);
      });
    }
  });
  
  export const { resetAllInvoice, setPage } = GetAllInvoiceSlice.actions;
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
        },
        product_sales:{
            sale_id:number;
            sale_qty: number;
            item_price: string;
            sale_discount: string;
            received_amount: string;
            purchase_id: number;
            customer_id:number ;
            taxable_sale?: boolean;
            created_at:string;
            updated_at:string;
        },
        total_paid_amount?: string; // Sum of all received_amount from all sales in transaction
        total_discount_amount?: string; // Sum of all sale_discount from all sales in transaction
       
}


const initialState ={
    isLoading: false,
    isError:false,
    isSuccess:false,
    errorMsg:'',
    data:{} as Invoicedata,
};
export const getOneInvoiceFN= createAsyncThunk(
    'getOneInvoice',
    async(id: string,{rejectWithValue})=>{
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') ?? '{}').accessToken;
            const res= await axios.get(`${Url}/invoice/${id}`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
              })

              return res.data
        } catch (error) {

            if (error instanceof AxiosError)
                return rejectWithValue(error.response?.data.message || errorMsg);
        
              return rejectWithValue(errorMsg); 
            
        }
    }
)

export const GetOneInvoiceSlice = createSlice({
    name:'getOneInvoice',
    reducers:{
        resetOneInvoice :()=> initialState
    },
    initialState,
    extraReducers(builder){
        builder.addCase(getOneInvoiceFN.pending,()=>({
            ...initialState,
            isLoading:true
        }));
        builder.addCase(getOneInvoiceFN.fulfilled,(_,action)=>({
            ...initialState,
            isSuccess:true,
            data:action.payload,

        }));
        builder.addCase(getOneInvoiceFN.rejected,(_,action)=>({
            ...initialState,
            isError:true,
            errorMsg:String(action.payload),
        }));
    }
})

export  const { resetOneInvoice} = GetOneInvoiceSlice.actions


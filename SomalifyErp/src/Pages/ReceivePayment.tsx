
import { PayReceiveFn, resetReceiveablePayment } from '@/Redux/Slice/PayReceive'
import { AppDispatch, RootState } from '@/Redux/Store'
import Nav from '@/components/Nav'

import  { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'



interface PayReceiveData {
    invoice_id: string;
    new_received_amount: string;
    new_sale_discount: string;
  }

function ReceivePayment() {
   const toastId= "ReceiveAple"
  const PayReceiveAbleState= useSelector((state:RootState)=>state.ReceiveAple)
  const { sale_id } = useParams<{ sale_id: string }>();
  const dispatch=useDispatch<AppDispatch>()
  const navigate = useNavigate()
 
 console.log("salw",sale_id)

  useEffect(() => {
    if (PayReceiveAbleState.isLoading) {
      toast.loading('pending...', { id: toastId });
    }
    if (PayReceiveAbleState.IsSuccess) {
      toast.success('Succeess.', { id: toastId });
      navigate('/Dashboard/ReceiveAble');
    }
    if (PayReceiveAbleState.isError) {
      toast.error(PayReceiveAbleState.errorMsg, { id: toastId });
    }
    
      dispatch(resetReceiveablePayment());
    
  }, [PayReceiveAbleState.isLoading, PayReceiveAbleState.IsSuccess, PayReceiveAbleState.isError, dispatch, navigate]);

  // const [sale_id,setPurcaseId]=useState('')
  const [new_received_amount,setPaid]=useState('')
  const [new_sale_discount,setDiscount]=useState('0')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: PayReceiveData ={
      invoice_id: sale_id || '', // sale_id from URL is actually invoice_id (UUID)
      new_received_amount,
      new_sale_discount,
    }
    dispatch(PayReceiveFn(data));
    console.log("data",data)
  };


  
  return (
    <div className='min-h-screen dark:text-white'>
        <div className='p-3 flex items-center justify-between'>
        <div className="navhome p-0 flex w-full justify-end">
          <Nav/>
        </div>
      </div>
        <div>
            <h1 className=' dark:text-white '>Payment</h1>
            <div className='bg-white  p-8 rounded-xl mt-7'>
                <form action="" onSubmit={handleSubmit} className='flex flex-col text-black w-[95%] m-auto'>
                   <label className='text-black' htmlFor="paid">Cash received (this payment)</label>
                   <input id="paid" value={new_received_amount} onChange={(e) => setPaid(e.target.value)} type="number" step="0.01" min="0" className='border-2 rounded-xl p-2 mb-4' placeholder='e.g. 100.00'/>
                   <label className='text-black' htmlFor="disc">Extra discount (this payment only)</label>
                   <p className="text-xs text-gray-500 mb-1">Leave <strong>0</strong> unless you are forgiving more money now. Do not re-enter the sale&apos;s original line discount.</p>
                   <input id="disc" type="number" step="0.01" min="0" value={new_sale_discount} onChange={(e) => setDiscount(e.target.value)} className='border-2 rounded-xl p-2' placeholder='0'/>
                   <button type='submit' className='bg-[#605BFF] min-w-[160px] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] my-8 text-white p-2   '>Receive Money</button>
                </form>

            </div>
        </div>

    </div>
  )
}

export default ReceivePayment
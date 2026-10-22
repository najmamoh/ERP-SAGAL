
import { PayReceiveFn, resetReceiveablePayment } from '@/Redux/Slice/PayReceive'
import { AppDispatch, RootState } from '@/Redux/Store'

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
    <div className='soft-page'>
      <div className='mb-4'>
        <h1 className='soft-title'>Receive Payment</h1>
        <p className='soft-subtitle'>Record cash received for this receivable.</p>
      </div>
      <form action="" onSubmit={handleSubmit} className='soft-card gap-4 max-w-xl'>
        <div className='soft-field-wrap'>
          <label className='soft-label' htmlFor="paid">Cash received (this payment)</label>
          <input id="paid" value={new_received_amount} onChange={(e) => setPaid(e.target.value)} type="number" step="0.01" min="0" className='soft-field' placeholder='e.g. 100.00'/>
        </div>
        <div className='soft-field-wrap'>
          <label className='soft-label' htmlFor="disc">Extra discount (this payment only)</label>
          <p className="text-xs text-slate-500 dark:text-slate-400">Leave <strong>0</strong> unless you are forgiving more money now. Do not re-enter the sale&apos;s original line discount.</p>
          <input id="disc" type="number" step="0.01" min="0" value={new_sale_discount} onChange={(e) => setDiscount(e.target.value)} className='soft-field' placeholder='0'/>
        </div>
        <div className='soft-actions'>
          <button type='submit' className='soft-submit'>Receive Money</button>
        </div>
      </form>
    </div>
  )
}

export default ReceivePayment
import { PayPayablFn, resetPayablesPayment } from '@/Redux/Slice/PayPayable'
import { AppDispatch, RootState } from '@/Redux/Store'

import  { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { useNavigate, useParams, useLocation } from 'react-router-dom'


interface PayPayablData {
  purchase_id: number;
  new_paid_amount: string;
  new_purchase_discount: string;
}


function Payment() {
   const toastId= "PayAbles"
  const PayPayableState= useSelector((state:RootState)=>state.PAymentPayable)
  const { purchase_id } = useParams<{ purchase_id: string }>();
  const dispatch=useDispatch<AppDispatch>()
  const navigate = useNavigate();
  const location = useLocation();
  const companyIdFromState = (location.state as { company_id?: string })?.company_id;
  const basePath = location.pathname.includes('/AdminDashboard/') ? 'AdminDashboard' : 'Dashboard';

  useEffect(() => {
    if (PayPayableState.isLoading) {
      toast.loading('Pending...', { id: toastId });
    }
    if (PayPayableState.IsSuccess) {
      toast.success('Payment recorded.', { id: toastId });
      const paymentData = {
        purchase_id: Number(purchase_id),
        new_paid_amount,
        new_purchase_discount,
      };
      dispatch(resetPayablesPayment());
      navigate(`/${basePath}/Receipt`, { state: paymentData });
    }
    if (PayPayableState.isError) {
      toast.error(PayPayableState.errorMsg, { id: toastId });
      dispatch(resetPayablesPayment());
    }
  }, [PayPayableState.isLoading, PayPayableState.IsSuccess, PayPayableState.isError, dispatch, navigate, basePath, purchase_id]);

  // const [purchase_id,setPurcaseId]=useState('')
  const [new_paid_amount,setPaid]=useState('0')
  const [new_purchase_discount,setDiscount]=useState('0')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: PayPayablData ={
      purchase_id: Number(purchase_id),
      new_paid_amount,
      new_purchase_discount,
      ...(companyIdFromState && { company_id: companyIdFromState }),
    }
    dispatch(PayPayablFn(data));
    console.log("data",data)
  };


  
  return (
    <div className='soft-page'>
      <div className='mb-4'>
        <h1 className='soft-title'>Payment</h1>
        <p className='soft-subtitle'>Record a payment against this payable.</p>
      </div>
      <form action="" onSubmit={handleSubmit} className='soft-card gap-4 max-w-xl'>
        <div className='soft-field-wrap'>
          <label className='soft-label' htmlFor='paid'>Paid amount</label>
          <input id='paid' value={new_paid_amount} onChange={(e) => setPaid(e.target.value)} type="number" className='soft-field' placeholder='Enter amount here.'/>
        </div>
        <div className='soft-field-wrap'>
          <label className='soft-label' htmlFor='discount'>Discount</label>
          <input id='discount' type="number" value={new_purchase_discount} onChange={(e) => setDiscount(e.target.value)} className='soft-field' placeholder='Enter amount here.'/>
        </div>
        <div className='soft-actions'>
          <button type='submit' className='soft-submit'>Pay money</button>
        </div>
      </form>
    </div>
  )
}

export default Payment
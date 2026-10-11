import { PayPayablFn, resetPayablesPayment } from '@/Redux/Slice/PayPayable'
import { AppDispatch, RootState } from '@/Redux/Store'
import Nav from '@/components/Nav'

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
    <div className='min-h-screen dark:text-white'>
        <div className='p-3 flex items-center justify-between  '>
        <div className="navhome p-0 flex w-full justify-end">
          <Nav/>
        </div>
      </div>
        <div>
            <h1 className=' dark:text-white '>Payment</h1>
            <div className='bg-white  p-8 rounded-xl mt-7'>
                <form action="" onSubmit={handleSubmit} className='flex flex-col text-black w-[95%] m-auto'>
                   <label className='text-black' htmlFor=""> New_Paid_Amount </label>
                   <input value={new_paid_amount} onChange={(e) => setPaid(e.target.value)} type="number" className='border-2 rounded-xl p-2 mb-4' placeholder='Enter Amoutn here.'/>
                   <label className='text-black' htmlFor=""> new discount </label>
                   <input type="number" value={new_purchase_discount} onChange={(e) => setDiscount(e.target.value)} className='border-2 rounded-xl p-2' placeholder='Enter Amoutn here.'/>
                   <button type='submit' className='bg-[#605BFF] min-w-[160px] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] my-8 text-white p-2   '>Pay money</button>
                </form>

            </div>
        </div>

    </div>
  )
}

export default Payment
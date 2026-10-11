
import { getOneProductFN } from '@/Redux/Slice/GEtOneProduct';
import { getOnePurchaseFn } from '@/Redux/Slice/GetOnePurchaseSlice';
import { getOneVendorFn } from '@/Redux/Slice/GetOneVendor';
import { AppDispatch, RootState } from '@/Redux/Store';
import  { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

function Recipt() {
  const handlePrint = () => {
    window.print();
  };

  const location = useLocation();
  const paymentData = location.state;
  const dispatch = useDispatch<AppDispatch>();

  const getOnePurchaseState = useSelector((state: RootState) => state.GetOnePurhhase);
  const OneVendorState = useSelector((state: RootState) => state.GetOneVendor);
  const OneproductState = useSelector((state: RootState) => state.GetONeProduct);

  const purchaseId = paymentData?.purchase_id;

  useEffect(() => {
    if (purchaseId) {
      dispatch(getOnePurchaseFn(purchaseId));
    }
  }, [purchaseId, dispatch]);

  useEffect(() => {
    const vendorId = getOnePurchaseState?.data?.vendor_id;
    if (vendorId) {
      dispatch(getOneVendorFn(vendorId));
    }
  }, [getOnePurchaseState?.data?.vendor_id, dispatch]);
  useEffect(() => {
    const productId = getOnePurchaseState?.data?.product_id;
    if (productId) {
      dispatch(getOneProductFN(productId));
    }
  }, [getOnePurchaseState?.data?.product_id, dispatch]);

  // console.log(getOnePurchaseState);
  // console.log(OneproductState);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString(); // Example: 3/6/2025
  const formattedTime = currentDate.toLocaleTimeString();
  return (
    <div className='min-h-screen'>
      <div className='flex flex-col'>
        
        <div className='w-full items-center text-center mt-6'>
          <h1 className='text-2xl font-bold underline underline-offset-4'>{OneproductState.data?.companies?.company_name} </h1>
          <h2 className='text-md font-semibold text-gray-500 space-x-0 '>Address:📍{OneproductState.data?.companies?.company_address}</h2>
          <h2 className='text-md font-semibold text-gray-500 space-x-0 '>Phone:📞{OneproductState.data?.companies?.company_phone}</h2>
          <h2 className='text-md font-semibold text-gray-500 space-x-0 '>Phone:📧{OneproductState.data?.companies?.company_email}</h2>



          <h2 className='text-md font-semibold text-gray-500 space-x-0 mt-4'>
            Date: 📅 {formattedDate} | Time: ⏰ {formattedTime}
          </h2>
        </div>
        <div className='bg-white my-8 py-14 text-black flex gap-2 w-[95%] m-auto'>
          <div className="w-[68%] overflow-x-auto sm:overflow-x-hidden">
            <table className="w-full table-auto border-collapse font-sans">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">S.L.</th>
                  <th className="px-4 py-2 text-left">Item Description</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Qty.</th>
                  <th className="px-4 py-2 text-left">Debt.</th>
                  <th className="px-4 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">{getOnePurchaseState.data?.purchase_id}</td>
                  <td className="px-4 py-2">
                   
                      <div key={OneproductState.data?.product_id}>{OneproductState.data?.product_name }</div>
                   
                  </td>
                  <td className="px-4 py-2">{getOnePurchaseState.data?.item_cost}</td>
                  <td className="px-4 py-2">{getOnePurchaseState.data?.purchase_qty}</td>
                  <td className="px-4 py-2">{getOnePurchaseState.data?.purchase_debt}</td>
                  <td className="px-4 py-2">{getOnePurchaseState.data?.purchase_qty * parseInt(getOnePurchaseState.data?.item_cost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="payment-info bg-slate-100 w-[30%] p-2 px-6">
            <h2 className='text-xl font-semibold'>Payment Info</h2>
            <div className="info-row flex justify-between my-3">
              <span className="label">Phone:</span>
              <span className="value">{OneVendorState.data.vendor_phone
              }</span>
            </div>
            <div className="info-row flex justify-between my-3">
              <span className="label">Vendor:</span>
              <span className="value">{OneVendorState.data.vendor_name}</span>
            </div>
            <hr />
            <div className="info-row flex justify-between my-3">
              <span className="label">SubTotal:</span>
              <span className="value">{getOnePurchaseState.data?.purchase_qty * parseInt(getOnePurchaseState.data?.item_cost) }</span>
            </div>
            <div className="info-row flex justify-between my-3">
              <span className="label">Tax:</span>
              <span className="value">$0</span>
            </div>
            <hr />
            <div className="info-row flex justify-between my-3">
              <span className="label">Discount:</span>
              <span className="value">${getOnePurchaseState.data?.purchase_discount}</span>
            </div>
            <hr />
            <div className="info-row flex justify-between my-3">
              <span className="label">Total:</span>
              <span className="value">{getOnePurchaseState.data?.purchase_qty * parseInt(getOnePurchaseState.data?.item_cost)- parseInt(getOnePurchaseState.data?.purchase_discount)}</span>
            </div>
            <div className="info-row flex justify-between my-3">
              <span className="label">Paid:</span>
              <span className="value">{getOnePurchaseState.data?.paid_amount}</span>
            </div>
          </div>
        </div>
        <button className='bg-cyan-600 w-[10%] m-auto p-2 rounded-xl min-w-[120px] my-3' onClick={handlePrint}>Print</button>
      </div>
    </div>
  );
}

export default Recipt;

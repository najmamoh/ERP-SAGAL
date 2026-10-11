import { getOnePurchaseFn } from '@/Redux/Slice/GetOnePurchaseSlice';
import { resetPurchaseUpdates, UpdatePurchaseFn } from '@/Redux/Slice/updatePurchase';

import { AppDispatch, RootState } from '@/Redux/Store';
// import { resetSaleUpdates } from '@/Redux/UpdateSaleSlice';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

function UpdatePurchase() {
  const toastId = "update";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OnePurchaseState = useSelector((state: RootState) => state.GetOnePurhhase);
  const UpdatePurchaseState = useSelector((state: RootState) => state.UpdateSale);

  const params = useParams();
  const id = params.purchase_id;

  const [vendorData, setVendorData] = useState({
    purchase_qty: 0,
    item_cost: '',
    purchase_discount: '',
    paid_amount: '',
    purchase_id: 0,
    // product_name: '',         // Product Name (read-only)
    manufacture_date: '',
    expiry_date: '',
    product_id:0
   
  });

  // Fetch sale details when id changes
  useEffect(() => {
    if (id) {
      dispatch(getOnePurchaseFn(+id));
    }
  }, [id, dispatch]);

  // Populate form data when sale data is available
  useEffect(() => {
    if (OnePurchaseState.data) {
      setVendorData({
        purchase_qty: OnePurchaseState.data.purchase_qty || 0,
        item_cost: OnePurchaseState.data.item_cost || '',
        purchase_discount: OnePurchaseState.data.purchase_discount || '',
        paid_amount: OnePurchaseState.data.paid_amount || '',
        purchase_id: OnePurchaseState.data.purchase_id || 0,
        // product_name: OnePurchaseState.data.products?.product_name || '',
        manufacture_date:OnePurchaseState.data.manufacture_date,
        expiry_date:OnePurchaseState.data.expiry_date,
        product_id:OnePurchaseState.data.product_id
        // customerName: OnePurchaseState.data.customers?.customer_name || '',
      });
    }
  }, [OnePurchaseState.data]);

  // Toast notifications for update status
  useEffect(() => {
    if (UpdatePurchaseState.isLoading) {
      toast.loading('Updating Sale...', { id: toastId });
    }
    if (UpdatePurchaseState.IsSuccess) {
      toast.success('Successfully updated sale.', { id: toastId });
      navigate('/Dashboard/Purchases/All');
      dispatch(resetPurchaseUpdates());
    }
    if (UpdatePurchaseState.isError) {
      toast.error(UpdatePurchaseState.errorMsg, { id: toastId });
    }
    if (UpdatePurchaseState.isLoading || UpdatePurchaseState.IsSuccess || UpdatePurchaseState.isError) {
      dispatch(resetPurchaseUpdates());
    }
  }, [UpdatePurchaseState.isLoading, UpdatePurchaseState.IsSuccess, UpdatePurchaseState.isError, dispatch, navigate]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setVendorData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const { purchase_id, ...updateData } = vendorData;
    dispatch(UpdatePurchaseFn({
        ...updateData,
        // Include purchase_id only as a separate parameter if needed by your API
        purchase_id: vendorData.purchase_id // Add this if your API expects it in the body
      }));
  };

  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="p-4 sm:p-6">
        <h1 className="font-semibold text-lg dark:text-white">Update Purchase</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 my-2 p-4 rounded-[8px] w-full flex flex-col">
          <div className="formdiv flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col">
                <label htmlFor="product_name">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ OnePurchaseState.data.products?.product_name}
                  disabled
                />
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="purchase_qty">Purchase Quantity</label>
                <input
                  type="number"
                  name="purchase_qty"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.purchase_qty}
                  onChange={handleInputChange}
                  min="0.01"
                  step="any"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="item_cost">Item Cost</label>
                <input
                  type="text"
                  name="item_cost"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.item_cost}
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="purchase_discount">Discount</label>
                <input
                  type="tel"
                  name="purchase_discount"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.purchase_discount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="paid_amount">Paid Amount</label>
                <input
                  type="text"
                  name="paid_amount"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.paid_amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className='flex flex-col justify-center'>
  <label htmlFor="manufacture_date">Manufactured date</label>
  <input
    type="date"
    id="manufacture_date"
    name="manufacture_date" // Add this
    value={vendorData.manufacture_date?.split('T')[0] || ''} // Format ISO date
    onChange={handleInputChange}
    className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
  />
</div>

<div className='flex flex-col justify-center'>
  <label htmlFor="expiry_date">Expire date</label>
  <input
    type="date"
    id="expiry_date"
    name="expiry_date" // Add this
    value={vendorData.expiry_date?.split('T')[0] || ''} // Format ISO date
    onChange={handleInputChange}
    className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
  />
</div>
            </div>
          </div>
          <div className="flex justify-end my-4">
            <button type="submit" className="bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] text-white p-2">
              Update Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdatePurchase;

import { getOnePurchaseFn } from '@/Redux/Slice/GetOnePurchaseSlice';
import { resetPurchaseUpdates, UpdatePurchaseFn } from '@/Redux/Slice/updatePurchase';

import { AppDispatch, RootState } from '@/Redux/Store';
// import { resetSaleUpdates } from '@/Redux/UpdateSaleSlice';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function UpdatePurchase() {
  const toastId = "update";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const OnePurchaseState = useSelector((state: RootState) => state.GetOnePurhhase);
  const UpdatePurchaseState = useSelector((state: RootState) => state.UpdatePurchase);

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
      toast.loading('Updating purchase...', { id: toastId });
      return;
    }
    if (UpdatePurchaseState.IsSuccess) {
      toast.success('Purchase updated.', { id: toastId });
      const base = location.pathname.startsWith('/AdminDashboard') ? '/AdminDashboard' : '/Dashboard';
      navigate(`${base}/Purchases`);
      dispatch(resetPurchaseUpdates());
    }
    if (UpdatePurchaseState.isError) {
      toast.error(UpdatePurchaseState.errorMsg || 'Could not update purchase.', { id: toastId });
      dispatch(resetPurchaseUpdates());
    }
  }, [UpdatePurchaseState.isLoading, UpdatePurchaseState.IsSuccess, UpdatePurchaseState.isError, UpdatePurchaseState.errorMsg, dispatch, navigate, location.pathname]);

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
    <div className="soft-page">
      <div className="max-w-6xl">
        <div className="mb-4">
          <h1 className="soft-title">Update Purchase</h1>
          <p className="soft-subtitle">Edit this purchase, then save your changes.</p>
        </div>
        <form onSubmit={handleSubmit} className="soft-card">
          <div className="formdiv flex flex-col gap-4">
            <div className="soft-grid">
              <div className="soft-field-wrap">
                <label htmlFor="product_name" className="soft-label">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  className="soft-field"
                  value={OnePurchaseState.data?.products?.product_name || ''}
                  disabled
                />
              </div>

              <div className="soft-field-wrap">
                <label htmlFor="purchase_qty" className="soft-label">Purchase Quantity</label>
                <input
                  type="number"
                  name="purchase_qty"
                  className="soft-field"
                  value={vendorData.purchase_qty}
                  onChange={handleInputChange}
                  min="0.01"
                  step="any"
                />
              </div>
              <div className="soft-field-wrap">
                <label htmlFor="item_cost" className="soft-label">Item Cost</label>
                <input
                  type="text"
                  name="item_cost"
                  className="soft-field"
                  value={vendorData.item_cost}
                  disabled
                />
              </div>
              <div className="soft-field-wrap">
                <label htmlFor="purchase_discount" className="soft-label">Discount</label>
                <input
                  type="tel"
                  name="purchase_discount"
                  className="soft-field"
                  value={vendorData.purchase_discount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="soft-field-wrap">
                <label htmlFor="paid_amount" className="soft-label">Paid Amount</label>
                <input
                  type="text"
                  name="paid_amount"
                  className="soft-field"
                  value={vendorData.paid_amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="soft-field-wrap">
                <label htmlFor="manufacture_date" className="soft-label">Manufactured date</label>
                <input
                  type="date"
                  id="manufacture_date"
                  name="manufacture_date"
                  value={vendorData.manufacture_date?.split('T')[0] || ''}
                  onChange={handleInputChange}
                  className="soft-field"
                />
              </div>

              <div className="soft-field-wrap">
                <label htmlFor="expiry_date" className="soft-label">Expire date</label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={vendorData.expiry_date?.split('T')[0] || ''}
                  onChange={handleInputChange}
                  className="soft-field"
                />
              </div>
            </div>
          </div>
          <div className="soft-actions">
            <button type="submit" className="soft-submit">
              Update Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdatePurchase;

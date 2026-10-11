
import { CreatePurchaseFn, createPurchasetData, resetPurchase } from '@/Redux/Slice/CreatePurchhaseSlice';
import { getAllVendorsFn } from '@/Redux/Slice/GetAllVendor';
import { getAllProductsFn } from '@/Redux/Slice/getAllProductsSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import  { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

interface CreatePurchaseProps {
  onSuccess?: () => void;
}

function CreatePurchase({ onSuccess }: CreatePurchaseProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 20;
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorPage, setVendorPage] = useState(1);
  const vendorPageSize = 20;
  const toastId = 'CreateVendor';    

  const [purchase_qty, setQuantity] = useState('');
  const [item_cost, setCost] = useState('');
  const [purchase_discount, setDiscount] = useState('');
  const [paid_amount, setPaid] = useState('');
  const [expiry_date, setExpire] = useState('');
  const [manufacture_date, setManufacture] = useState('');
  const [vendor_id, setVendor] = useState('');
  const [product_id, setProductId] = useState('');
  const [container_number, setContainerNumber] = useState('');
  const [to_store, setToStore] = useState(false);

  const AllProductsState = useSelector((state: RootState) => state.AllProduct);
  const dispatch = useDispatch<AppDispatch>();

  // Paid = Quantity * Cost Per item - Discount
  useEffect(() => {
    const qty = Number(String(purchase_qty).replace(',', '.'));
    const cost = Number(String(item_cost).replace(',', '.'));
    const discount = Number(String(purchase_discount).replace(',', '.')) || 0;
    if (!Number.isFinite(qty) || !Number.isFinite(cost) || purchase_qty === '' || item_cost === '') {
      setPaid('');
      return;
    }
    const paid = Math.max(0, qty * cost - discount);
    setPaid(String(Number(paid.toFixed(4))));
  }, [purchase_qty, item_cost, purchase_discount]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      dispatch(getAllProductsFn({
        page: productPage,
        pageSize: productPageSize,
        search: searchTerm
      }));
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, productPage, dispatch]);

  // useEffect(() => {
  //   dispatch(getAllProductsFn());
  // }, [dispatch]);

  const AllVendorState = useSelector((state: RootState) => state.AllVendors);
  
  useEffect(() => {
    const id = setTimeout(() => {
      dispatch(getAllVendorsFn({ page: vendorPage, pageSize: vendorPageSize, search: vendorSearch }));
    }, 300);
    return () => clearTimeout(id);
  }, [vendorSearch, vendorPage, dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const qty = Number(String(purchase_qty).replace(',', '.'));
    const cost = String(item_cost).trim();
    if (!product_id || !vendor_id || !Number.isFinite(qty) || qty <= 0 || cost === '') {
      toast.error('Select a product, vendor, quantity, and cost.', { id: toastId });
      return;
    }
    const data: createPurchasetData = {
      purchase_qty: qty,
      item_cost: cost,
      paid_amount: paid_amount.trim() === '' ? '0' : paid_amount,
      product_id: +product_id,
      purchase_discount: purchase_discount.trim() === '' ? '0' : purchase_discount,
      vendor_id: +vendor_id,
      manufacture_date,
      expiry_date,
      container_number: container_number.trim(),
      to_store: to_store, // If checked, products go directly to company store
    };
    dispatch(CreatePurchaseFn(data));
  };

  const createPurchaseState = useSelector((state: RootState) => state.createPurchase);

  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');

  useEffect(() => {
    if (createPurchaseState.isLoading) toast.loading('Saving...', { id: toastId });
    if (createPurchaseState.isSuccess) {
      toast.success('Successfully created', { id: toastId });
       // Reset all form fields
    setQuantity('');
    setCost('');
    setDiscount('');
    setPaid('');
    setExpire('');
    setManufacture('');
    setVendor('');
    setProductId('');
    setContainerNumber('');
    setToStore(false);
    
    // Optional: Reset search and pagination states if needed
    setSearchTerm('');
    setProductPage(1);
    setVendorSearch('');
    setVendorPage(1);
    
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
    // Only reset purchase state on success
    dispatch(resetPurchase());
    }
    if (createPurchaseState.isError) {
      toast.error(createPurchaseState.errorMsg, { id: toastId });
      // Reset purchase state on error too, but don't clear form fields
      dispatch(resetPurchase());
    }
  }, [createPurchaseState.isLoading, createPurchaseState.isSuccess, createPurchaseState.isError, onSuccess, dispatch]);
  
  return (
    <div className='w-full'>
      <div className='bg-white dark:bg-gray-900 text-black dark:text-white p-6'>
        {isAdminDashboard && (
          <div className='mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200'>
            <strong>Flow:</strong> Items go to the main warehouse. Then go to <strong>Warehouse</strong> and transfer to company stores. Company users will receive them into their store and can then sell.
          </div>
        )}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col justify-center'>
      <label htmlFor="product">Select Product</label>
      
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
      />

      {/* Product Dropdown */}
      <select
        id="product"
        value={product_id}
        onChange={(e) => setProductId(e.target.value)}
        className="bg-[#F7F7F8] p-2 rounded-[8px] text-gray-400 my-2"
      >
        <option>Select Products</option>
        {AllProductsState?.data?.map((product) => (
          <option key={product.product_id} value={product.product_id}>
            {product.product_name} ({product.product_code})
          </option>
        ))}
      </select>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center my-2">
        <button
          type="button"
          onClick={() => setProductPage(p => Math.max(1, p - 1))}
          disabled={productPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        
        <span>Page {productPage}</span>
        
        <button
          type="button"
          onClick={() => setProductPage(p => p + 1)}
          disabled={!AllProductsState?.hasMore}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
          <div className='flex flex-col justify-center'>
            <label htmlFor="vendor">Select Vendor</label>
            <input
        placeholder="Search vendors..."
        value={vendorSearch}
        onChange={e => setVendorSearch(e.target.value)}
        className='bg-[#F7F7F8] p-2 rounded-[8px] my-2'
      />
      <select value={vendor_id}
        onChange={(e) => setVendor(e.target.value)}  className="bg-[#F7F7F8] p-2 rounded-[8px] text-gray-400 my-2">
        <option>Select Vendor</option>
        {AllVendorState.data.map(v => (
          <option key={v.vendor_id} value={v.vendor_id}>
            {v.vendor_name}
          </option>
        ))}
      </select>
      <div className="flex justify-between items-center my-2">
      <button disabled={vendorPage === 1} onClick={() => setVendorPage(p => p - 1)}>
        Prev
      </button>
      <span>Page {AllVendorState.page}</span>
      <button
        disabled={!AllVendorState.hasMore}
        onClick={() => setVendorPage(p => p + 1)}
      >
        Next
      </button>
      </div>
          </div>
          <div className='flex flex-col justify-center'>
            <label htmlFor="container_number">Container number</label>
            <input
              type="text"
              id="container_number"
              value={container_number}
              onChange={(e) => setContainerNumber(e.target.value)}
              className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
              placeholder='e.g. CNT-001'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              min="0.01"
              step="any"
              value={purchase_qty}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
              placeholder='Enter quantity (e.g. 0.3, 2.5)'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <label htmlFor="cost">Cost Per item</label>
            <input
              type="number"
              id="cost"
              value={item_cost}
              onChange={(e) => setCost(e.target.value)}
              className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
              placeholder='Enter cost here.'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <label htmlFor="discount">Discount</label>
            <input
              type="number"
              id="discount"
              value={purchase_discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
              placeholder='Enter discount here.'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <label htmlFor="paid">Paid</label>
            <input
              type="number"
              id="paid"
              value={paid_amount}
              onChange={(e) => setPaid(e.target.value)}
              className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
              placeholder='Quantity × Cost − Discount (editable)'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <label htmlFor="manufacture_date">Manufactured date</label>
            <input
              type="date"
              id="manufacture_date"
              value={manufacture_date}
              onChange={(e) => setManufacture(e.target.value)}
              className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
              placeholder='Enter manufactured date here.'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <label htmlFor="expiry_date">Expire date</label>
            <input
              type="date"
              id="expiry_date"
              value={expiry_date}
              onChange={(e) => setExpire(e.target.value)}
              className="bg-[#F7F7F8] p-2 rounded-[8px] my-2"
              placeholder='Enter expire date here.'
            />
          </div>
          <div className='flex items-center gap-3 my-4'>
            <input
              type="checkbox"
              id="to_store"
              checked={to_store}
              onChange={(e) => setToStore(e.target.checked)}
              className="w-5 h-5 text-[#605BFF] bg-gray-100 border-gray-300 rounded focus:ring-[#605BFF] focus:ring-2"
            />
            <label htmlFor="to_store" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Store - Send directly to company store (if unchecked, products will go to warehouse first)
            </label>
          </div>
          <button type='submit' className='p-2 px-4 my-4 max-w-[480px] m-auto bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center items-center text-white'>
            Create purchase
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePurchase;

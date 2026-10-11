// import { getOneSaleFn } from '@/Redux/Slice/GetOneSale';
// import { getOneVendorFn } from '@/Redux/Slice/GetOneVendor';
// import { resetVendorUpdates, UpdateVendorFn } from '@/Redux/Slice/updateVEnderSlice';
// import { AppDispatch, RootState } from '@/Redux/Store';
// import { UpdateSaleFn } from '@/Redux/UpdateSaleSlice';
// import Nav from '@/components/Nav';
// import SideParsm from '@/components/SideParsm';
// import  { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';

// function UpdateSale() {
//   const toastId = "update";
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const OneSaleState = useSelector((state: RootState) => state.getOneSale);
//   const UpdateSaletate = useSelector((state: RootState) => state.UpdateVendor);

//   const params = useParams();
//   const id = params.sale_id;

//   const [vendorData, setVendorData] = useState({
//     sale_qty: 0,
//     item_price: '',
//     sale_discount: '',
//     received_amount: '',
//     sale_id:0,
//     product: '',         // For product name
//     customerName: '', 
//   });

//   useEffect(() => {
//     if (id) {
//       dispatch(getOneSaleFn(+id));
//     }
//   }, [id, dispatch]);

//   useEffect(() => {
//     if (OneSaleState.data) {
//       setVendorData({
//         sale_qty: OneSaleState.data.sale_qty || 0,
//         item_price: OneSaleState.data.item_price || '',
//         sale_discount: OneSaleState.data.sale_discount || '',
//         received_amount: OneSaleState.data.received_amount || '',
//         sale_id:OneSaleState.data.sale_id || 0,
//         product: OneSaleState.data.product_purchases?.products?.product_name || '',
//         customerName: OneSaleState.data.customers?.customer_name || '',
//       });
//     }
//   }, [OneSaleState.data]);

//   useEffect(() => {
//     if (UpdateSaletate.isLoading) {
//       toast.loading('Updating Sale...', { id: toastId });
//     }
//     if (UpdateSaletate.IsSuccess) {
//       toast.success('Successfully updated.', { id: toastId });
//       navigate('/Dashboard/Vendor');
//     }
//     if (UpdateSaletate.isError) {
//       toast.error(UpdateSaletate.errorMsg, { id: toastId });
//     }
//     if (UpdateSaletate.isLoading || UpdateSaletate.IsSuccess || UpdateSaletate.isError) {
//       dispatch(resetVendorUpdates());
//     }
//   }, [UpdateSaletate.isLoading, UpdateSaletate.IsSuccess, UpdateSaletate.isError, dispatch, navigate]);

//   const handleInputChange = (e:any) => {
//     const { name, value } = e.target;
//     setVendorData({
//       ...vendorData,
//       [name]: value
//     });
//   };

//   const handleSubmit = (e:any) => {
//     e.preventDefault();
//     dispatch(UpdateSaleFn(vendorData));
//   };

//   return (
//     <div className="min-h-screen text-black dark:text-white">
//       <div className='p-3 flex items-center justify-between'>
//         <h1 className='lg:hidden '>
//           <SideParsm />
//         </h1>
//         <div className="navhome p-0 flex w-full justify-end">
//           <Nav />
//         </div>
//       </div>
//       <div>
//         <h1 className="font-semibold text-lg dark:text-white">Update Sale</h1>
//         <form onSubmit={handleSubmit} className="bg-white text-black my-2 p-4 rounded-[8px] w-full flex flex-col">
//           <div className="formdiv flex flex-col gap-4">
//             <div className="grid grid-cols-4 gap-2">
//             <div className="flex flex-col">
//                 <label htmlFor="product">Product Name</label>
//                 <input
//                   type="text"
//                   name="product"
//                   className="border border-gray-400 rounded-[10px] p-2"
//                   value={vendorData.product}
//                   disabled
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="customerName">Customer Name</label>
//                 <input
//                   type="text"
//                   name="customerName"
//                   className="border border-gray-400 rounded-[10px] p-2"
//                   value={vendorData.customerName}
//                   disabled
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="sale_qty">Sale Quantity</label>
//                 <input
//                   type="text"
//                   name="sale_qty"
//                   className="border border-gray-400 rounded-[10px] p-2"
//                   value={vendorData.sale_qty}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="item_price">Item Price</label>
//                 <input
//                   type="text"
//                   name="item_price"
//                   className="border border-gray-400 rounded-[10px] p-2"
//                   value={vendorData.item_price}
//                   disabled
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="sale_discount">Discount</label>
//                 <input
//                   type="tel"
//                   name="sale_discount"
//                   className="border border-gray-400 rounded-[10px] p-2"
//                   value={vendorData.sale_discount}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="received_amount">Recieved Amount</label>
//                 <input
//                   type="text"
//                   name="received_amount"
//                   className="border border-gray-400 rounded-[10px] p-2"
//                   value={vendorData.received_amount}
//                   onChange={handleInputChange}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="flex justify-end my-4">
//             <button type='submit' className='bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] text-white p-2'>Update Sale</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default UpdateSale;

import { getOneSaleFn } from '@/Redux/Slice/GetOneSale';

import { AppDispatch, RootState } from '@/Redux/Store';
import { resetSaleUpdates, UpdateSaleFn } from '@/Redux/UpdateSaleSlice';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateSale() {
  const toastId = "update";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OneSaleState = useSelector((state: RootState) => state.getOneSale);
  const UpdateSaleState = useSelector((state: RootState) => state.UpdateSale);

  const params = useParams();
  const id = params.sale_id;

  const [vendorData, setVendorData] = useState({
    sale_qty: 0,
    item_price: '',
    sale_discount: '',
    received_amount: '',
    sale_id: 0,
    product: '',         // Product Name (read-only)
    customerName: '',    // Customer Name (read-only)
  });

  // Fetch sale details when id changes
  useEffect(() => {
    if (id) {
      dispatch(getOneSaleFn(+id));
    }
  }, [id, dispatch]);

  // Populate form data when sale data is available
  useEffect(() => {
    if (OneSaleState.data) {
      setVendorData({
        sale_qty: OneSaleState.data.sale_qty || 0,
        item_price: OneSaleState.data.item_price || '',
        sale_discount: OneSaleState.data.sale_discount || '',
        received_amount: OneSaleState.data.received_amount || '',
        sale_id: OneSaleState.data.sale_id || 0,
        product: OneSaleState.data.product_purchases?.products?.product_name || '',
        customerName: OneSaleState.data.customers?.customer_name || '',
      });
    }
  }, [OneSaleState.data]);

  // Toast notifications for update status
  useEffect(() => {
    if (UpdateSaleState.isLoading) {
      toast.loading('Updating Sale...', { id: toastId });
    }
    if (UpdateSaleState.IsSuccess) {
      toast.success('Successfully updated sale.', { id: toastId });
      navigate('/Dashboard/Sales/Lists');
    }
    if (UpdateSaleState.isError) {
      toast.error(UpdateSaleState.errorMsg, { id: toastId });
    }
    if (UpdateSaleState.isLoading || UpdateSaleState.IsSuccess || UpdateSaleState.isError) {
      dispatch(resetSaleUpdates());
    }
  }, [UpdateSaleState.isLoading, UpdateSaleState.IsSuccess, UpdateSaleState.isError, dispatch, navigate]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setVendorData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    dispatch(UpdateSaleFn(vendorData));
  };

  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="p-4 sm:p-6">
        <h1 className="font-semibold text-lg dark:text-white">Update Sale</h1>
        <form onSubmit={handleSubmit} className="bg-white text-black dark:text-black my-2 p-4 rounded-[8px] w-full flex flex-col">
          <div className="formdiv flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col">
                <label htmlFor="product">Product Name</label>
                <input
                  type="text"
                  name="product"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.product}
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="customerName">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.customerName}
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="sale_qty">Sale Quantity</label>
                <input
                  type="number"
                  name="sale_qty"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.sale_qty}
                  onChange={handleInputChange}
                  min="0.01"
                  step="any"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="item_price">Item Price</label>
                <input
                  type="text"
                  name="item_price"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.item_price}
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="sale_discount">Discount</label>
                <input
                  type="tel"
                  name="sale_discount"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.sale_discount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="received_amount">Received Amount</label>
                <input
                  type="text"
                  name="received_amount"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.received_amount}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end my-4">
            <button type="submit" className="bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] text-white p-2">
              Update Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateSale;

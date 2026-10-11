// import { getOnePurchaseFn } from '@/Redux/Slice/GetOnePurchaseSlice';
// import { AppDispatch, RootState } from '@/Redux/Store';
// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { useSelector } from 'react-redux';
// import { useLocation, useNavigate } from 'react-router-dom';

// function SaleReceipt() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const salesData = location.state?.salesData;

//   // console.log(salesData)

//   // const saleID= salesData.map(item => item.sale_id)
// //  console.log(saleID)
//   const OneproductState = useSelector((state: RootState) => state.GetONeProduct);
//   const getOnePurchaseState = useSelector((state: RootState) => state.GetOnePurhhase);


//   const purchaseIds = salesData.map((sale: any) => sale.purchase_id);
//   const dispatch = useDispatch<AppDispatch>();
//   // useEffect(() => {
//   //     if (purchaseIds) {
//   //       dispatch(getOnePurchaseFn(purchaseIds));
//   //     }
//   //   }, [purchaseIds]);

// console.log("pur",getOnePurchaseState)
//   // Calculate totals directly from sales data
//   const subtotal = salesData?.reduce((acc: number, sale: any) => {
//     const price = parseFloat(sale.item_price) || 0;
//     const qty = parseFloat(sale.sale_qty) || 0;
//     const discount = parseFloat(sale.sale_discount) || 0;
//     return acc + (price * qty) - discount;
//   }, 0) || 0;

//   const taxRate = 0.1; // 10% tax
//   const tax = subtotal * taxRate;
//   const total = subtotal + tax;
//   const paid = salesData?.reduce((acc: number, sale: any) => 
//     acc + (parseFloat(sale.received_amount) || 0), 0) || 0;
//   const balance = total - paid;

//   const handlePrint = () => window.print();


//   const currentDate = new Date();
//   const formattedDate = currentDate.toLocaleDateString(); // Example: 3/6/2025
//   const formattedTime = currentDate.toLocaleTimeString();

//   return (
//     <div className='min-h-screen flex flex-col items-center p-4'>
//       {/* Company Header */}
//       <div className='text-center mb-8 bg-blue-50 py-6 px-4 rounded-lg w-full max-w-4xl'>
//         <h1 className='text-3xl font-bold text-blue-800 mb-2'>Your Company Name</h1>
//         <p className='text-sm text-gray-600'>123 Business Street, City</p>
//         <p className='text-sm text-gray-600'>Tel: (123) 456-7890</p>
//         <h2 className='text-md font-semibold text-gray-500 space-x-0 mt-4'>
//             Date: 📅 {formattedDate} | Time: ⏰ {formattedTime}
//           </h2>
//       </div>

//       {/* Sale Items Table */}
//       <div className='bg-white my-8 py-6 text-black w-full max-w-4xl shadow-md rounded-lg p-6'>
//         <table className='w-full border-collapse'>
//           <thead>
//             <tr className='bg-gray-200'>
//               <th className='px-4 py-2 text-left'>#</th>
//               <th className='px-4 py-2 text-left'>Item</th>
//               <th className='px-4 py-2 text-left'>Price</th>
//               <th className='px-4 py-2 text-left'>Qty</th>
//               <th className='px-4 py-2 text-left'>Discount</th>
//               <th className='px-4 py-2 text-left'>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {salesData?.map((sale: any, index: number) => {
//               const price = parseFloat(sale.item_price) || 0;
//               const qty = parseFloat(sale.sale_qty) || 0;
//               const discount = parseFloat(sale.sale_discount) || 0;
//               const total = (price * qty) - discount;

//               return (
//                 <tr key={index} className='border-b'>
//                   <td className='px-4 py-2'>{index + 1}</td>
//                   <td className='px-4 py-2'>Product {index + 1}</td>
//                   <td className='px-4 py-2'>${price.toFixed(2)}</td>
//                   <td className='px-4 py-2'>{qty}</td>
//                   <td className='px-4 py-2'>${discount.toFixed(2)}</td>
//                   <td className='px-4 py-2'>${total.toFixed(2)}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>

//         {/* Payment Summary */}
//         <div className='bg-slate-100 mt-6 p-4 rounded-lg'>
//           <h2 className='text-xl font-semibold mb-4'>Payment Summary</h2>
//           <div className='space-y-2'>
//             <div className='flex justify-between'>
//               <span>Subtotal:</span>
//               <span>${subtotal.toFixed(2)}</span>
//             </div>
//             <div className='flex justify-between'>
//               <span>Tax ({taxRate * 100}%):</span>
//               <span>${tax.toFixed(2)}</span>
//             </div>
//             <hr className='my-2' />
//             <div className='flex justify-between font-bold'>
//               <span>Total:</span>
//               <span>${total.toFixed(2)}</span>
//             </div>
//             <hr className='my-2' />
//             <div className='flex justify-between text-green-600'>
//               <span>Paid:</span>
//               <span>${paid.toFixed(2)}</span>
//             </div>
//             <div className='flex justify-between text-red-600'>
//               <span>Balance:</span>
//               <span>${balance.toFixed(2)}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className='flex gap-4 mt-4'>
//         <button 
//           className='bg-cyan-600 text-white py-2 px-6 rounded-lg hover:bg-cyan-700'
//           onClick={handlePrint}
//         >
//           Print Invoice
//         </button>
//         <button
//           className='bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700'
//           onClick={() => navigate('/Dashboard')}
//         >
//           Back to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// }

// export default SaleReceipt;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
// import { getAllPurchasesFn } from '@/Redux/Slice/AllPurchases';
// import { getAllCustomerFn } from '@/Redux/Slice/AllCustomers';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
import { useDispatch } from 'react-redux';
// import { getOnePurchaseFn } from '@/Redux/Slice/GetOnePurchaseSlice';

interface Sale {
  sale_qty: number;
  item_price: string;
  sale_discount: string;
  received_amount: string;
  purchase_id: number;
  customer_id: string;
  taxable_sale: boolean;
  product_name:string
}

// const TAX_RATE = 0.1; // 10% tax

const SaleReceipt = () => {
  const location = useLocation();
  const salesData: Sale[] = location.state?.salesData || [];
  // const AllPurchases = useSelector((state: RootState) => state.AllPurchases.data);
  const AllCustomers = useSelector((state: RootState) => state.AllCustomer.data);
  const  GetCompanyState= useSelector((state:RootState)=> state.GetOneCompanay)
  //  const getOnePurchaseState = useSelector((state: RootState) => state.GetOnePurhhase);


  // const purchaseIds = salesData.map((sale: any) => sale.purchase_id);
  const dispatch = useDispatch<AppDispatch>();
  // useEffect(() => {
  //     if (purchaseIds) {
  //       dispatch(getOnePurchaseFn(purchaseIds));
  //     }
  //   }, [purchaseIds]);
  const groupedSales = salesData.reduce((acc, sale) => {

    const key = sale.customer_id || 'unknown';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);

  // Calculate totals for a group of sales
  const calculateTotals = (sales: Sale[]) => {
    return sales.reduce((acc, sale) => {
      const price = parseFloat(sale.item_price);
      const discount = parseFloat(sale.sale_discount);
      const received = parseFloat(sale.received_amount);
      const subtotal = sale.sale_qty * price;
      const lineTotal = subtotal - discount;
      
      acc.totalQuantity += sale.sale_qty;
      acc.totalDiscount += discount;
      acc.subtotal += lineTotal;
      acc.taxableAmount += sale.taxable_sale ? lineTotal : 0;
      acc.totalReceived += received; // Add received amount
      
      return acc;
    }, {
      totalQuantity: 0,
      totalDiscount: 0,
      subtotal: 0,
      taxableAmount: 0,
      totalReceived: 0 // Initialize received total
    });
  };

  const handlePrint = () => window.print();
   
  
    useEffect(()=>{
      dispatch(getOneCompanayFN());
    },[])
    

    const Tax = (GetCompanyState.data.tax_percentage || 0) / 100;
  return (
    <div className="invoice-container w-full min-h-screen p-8 text-black">
      {Object.entries(groupedSales).map(([customerId, sales]) => {
        const customer = AllCustomers.find(c => c.customer_id === +customerId);
        const totals = calculateTotals(sales);
        const taxTotal = totals.taxableAmount * Tax;
        const grandTotal = totals.subtotal + taxTotal;

        return (
          <div key={customerId} className="mb-8 p-6 border rounded-lg shadow-lg bg-white">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-800 uppercase">{GetCompanyState.data.company_name}</h1>
              <p className="text-gray-600">{GetCompanyState.data.company_address}</p>
              <p className='text-sm text-gray-600'>Tel: {GetCompanyState.data.company_phone || "Null"}</p>
              <p className='text-sm text-gray-600'>Email: {GetCompanyState.data.company_email}</p>
            </div>

            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{customer?.customer_name || 'Walk-in Customer'}</h2>
                <p className="text-gray-600">{customer?.customer_phone}</p>
               
                {/* <p className="text-gray-600">{customer?.customer_email}</p> */}
              </div>
              <div className="text-right">
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Invoice #: {Math.floor(100000 + Math.random() * 900000)}</p>
              </div>
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Discount</th>
                  <th className="p-3 text-right">Tax</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => {
                  // const purchase = AllPurchases.find(p => p.purchase_id === sale.purchase_id);
                  const price = parseFloat(sale.item_price);
                  const discount = parseFloat(sale.sale_discount);
                  const total = (sale.sale_qty * price - discount) + (sale.taxable_sale ? sale.sale_qty * price * Tax : 0);

                  return (
                    <tr key={index} className="border-t">
                      <td className="p-3">{sale.product_name}</td>
                      <td className="p-3 text-right">{sale.sale_qty}</td>
                      <td className="p-3 text-right">${price.toFixed(2)}</td>
                      <td className="p-3 text-right">${discount.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        {sale.taxable_sale ? `$${(sale.sale_qty * price * Tax).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="p-3 text-right font-bold">${total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="text-right space-y-2">
            <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>
            <p>Total Discount: ${totals.totalDiscount.toFixed(2)}</p>
            <p>Tax {GetCompanyState.data.tax_percentage}%: ${taxTotal.toFixed(2)}</p>
            <p className="text-2xl font-bold border-t pt-2">
              Grand Total: ${grandTotal.toFixed(2)}
            </p>
            {/* Add Received and Balance */}
            <div className="border-t pt-2">
              <p className="text-green-600">Total Received: ${totals.totalReceived.toFixed(2)}</p>
              <p className="text-red-600">Balance Due: ${(grandTotal - totals.totalReceived).toFixed(2)}</p>
            </div>
          </div>

            <div className="text-center mt-8">
              <button 
                onClick={handlePrint}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Print Receipt
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SaleReceipt;
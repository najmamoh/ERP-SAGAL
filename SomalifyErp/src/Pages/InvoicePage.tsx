// // InvoicePage.tsx

// import { useDispatch, useSelector } from 'react-redux';
// import { useParams, Link } from 'react-router-dom';


// import { format } from 'date-fns';
// // import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';
// import { getOneInvoiceFN } from '@/Redux/Slice/getOneInvoice';
// import { AppDispatch, RootState } from '@/Redux/Store';
// import { useEffect } from 'react';




// const safeDate = (dateString?: string | null) => {
//     if (!dateString) return null;
//     const date = new Date(dateString);
//     return isNaN(date.getTime()) ? null : date;
//   };

// const InvoicePage = () => {
//   const { id } = useParams<{ id: string }>();

// // const params = useParams();
// //   const id = params.id
  
//   const dispatch = useDispatch<AppDispatch>();
//   const OneInvoiceState = useSelector(
//     (state: RootState) => state.getOneInvoice
//   );


//   console.log("id",id)
  
// useEffect(() => {
//     console.log("useEffect triggered with ID:", id);
//     if (id) {
//       console.log("Dispatching request for ID:", id);
//       dispatch(getOneInvoiceFN(id));
//     }
//   }, [id, dispatch]);
  

//   console.log(OneInvoiceState)

//   const handlePrint = () => {
//     window.print();
//   };

 
//   return (
//     <div className="container mx-auto p-6">
//       <div className="print:hidden mb-6">
//         <Link
//           to="/invoices"
//           className="flex items-center text-blue-600 hover:text-blue-800"
//         >
//           {/* <ArrowLeftIcon className="h-5 w-5 mr-2" /> */}
//           Back to Invoices
//         </Link>
//       </div>

//       <div className="bg-white p-8 rounded-lg shadow-lg print:shadow-none text-black">
//         {/* Header Section */}
//         <div className="flex justify-between items-start mb-8">
//           <div>
//             <h1 className="text-2xl font-bold">{OneInvoiceState.data.invoice_number}</h1>
//             <p className="text-gray-600">
//                 Issued: {safeDate(OneInvoiceState.data.issue_date) ? 
//                     format(safeDate(OneInvoiceState.data.issue_date)!, 'MMM dd, yyyy') : 
//                     'Invalid date'}
//                 </p>
//                 <p className="text-gray-600">
//                 Due: {safeDate(OneInvoiceState.data.due_date) ? 
//                     format(safeDate(OneInvoiceState.data.due_date)!, 'MMM dd, yyyy') : 
//                     'Invalid date'}
//                 </p>
//           </div>
//           <button
//             onClick={handlePrint}
//             className="print:hidden bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
//           >
//             {/* <PrinterIcon className="h-5 w-5 mr-2" /> */}
//             Print Invoice
//           </button>
//         </div>

//         {/* Company and Customer Info */}
//         <div className="grid grid-cols-2 gap-8 mb-8">
//           <div>
//             <h2 className="font-semibold mb-2">Company</h2>
            
//             <p>{OneInvoiceState.data.company?.company_name||'sample'}</p>
//             <p>{OneInvoiceState.data.company?.company_address}</p>
//             <p>{OneInvoiceState.data.company?.company_phone}</p>
//           </div>
//           <div>
//             <h2 className="font-semibold mb-2">Customer</h2>
//             <p>{OneInvoiceState.data.customer?.customer_name || 'No customer assigned'}</p>
//             <p>{OneInvoiceState.data.customer?.customer_address}</p>
//             <p>{OneInvoiceState.data.customer?.customer_phone}</p>
//           </div>
//         </div>

//         {/* Items Table */}
//         <div className="mb-8">
//           <h2 className="font-semibold mb-4">Items</h2>
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-3 text-left">Product</th>
//                 <th className="p-3 text-left">Quantity</th>
//                 <th className="p-3 text-left">Unit Price</th>
//                 <th className="p-3 text-left">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {OneInvoiceState.data.items?.map((item) => (
//                 <tr key={item.id} className="border-b">
//                   <td className="p-3">{item.product.product_name}</td>
//                   <td className="p-3">{item.quantity}</td>
//                   <td className="p-3">${item.unit_price}</td>
//                   <td className="p-3">
//                     ${Number(item.unit_price) * item.quantity}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Totals Section */}
//         <div className="flex justify-end">
//           <div className="w-64">
//             <div className="flex justify-between mb-2">
//               <span>Subtotal:</span>
//               <span>${OneInvoiceState.data.total_amount}</span>
//             </div>
//             <div className="flex justify-between mb-2">
//               <span>Tax ({OneInvoiceState.data.company?.tax_percentage}%):</span>
//               <span>${OneInvoiceState.data.tax_amount}</span>
//             </div>
//             <div className="flex justify-between font-bold">
//               <span>Total:</span>
//               <span>
//                 $
//                 {Number(OneInvoiceState.data.total_amount) + Number(OneInvoiceState.data.tax_amount)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
    
//   );
// };

// export default InvoicePage;




// InvoicePage.tsx
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getOneInvoiceFN } from '@/Redux/Slice/getOneInvoice';
import { delSaleFn, resetDelSale } from '@/Redux/Slice/DeleteSale';
import { useCompanyPermissions } from '@/hooks/useCompanyPermissions';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const safeDate = (dateString?: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const InvoicePage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const OneInvoiceState = useSelector((state: RootState) => state.getOneInvoice);
  const delSaleState = useSelector((state: RootState) => state.DeleteSale);
  const { canDelete } = useCompanyPermissions();

  useEffect(() => {
    if (id) dispatch(getOneInvoiceFN(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (delSaleState.isSuccess) {
      toast.success('Invoice voided successfully.');
      dispatch(resetDelSale());
      if (id) dispatch(getOneInvoiceFN(id));
    }
    if (delSaleState.isError) {
      toast.error(delSaleState.errorMsg || 'Could not void invoice.');
      dispatch(resetDelSale());
    }
  }, [delSaleState, dispatch, id]);

  const handleVoidInvoice = () => {
    const invoice = OneInvoiceState.data;
    if (!invoice?.sale_id) return;
    const ok = window.confirm(
      'Void this invoice? Stock quantities will be restored. The invoice will stay in the system as VOID and will be excluded from sales reports.'
    );
    if (ok) dispatch(delSaleFn(invoice.sale_id));
  };

  if (OneInvoiceState.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/80 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }
  if (OneInvoiceState.isError) {
    return (
      <div className="min-h-screen bg-slate-50/80 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl">!</div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-6">{OneInvoiceState.errorMsg}</p>
          <Link to="/Dashboard/invoices" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-100 text-blue-800 font-medium hover:bg-blue-200/80 border border-blue-200/80">
            ← Back to Invoices
          </Link>
        </div>
      </div>
    );
  }
  if (!OneInvoiceState.data) {
    return (
      <div className="min-h-screen bg-slate-50/80 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md text-center">
          <p className="text-slate-500">Invoice not found.</p>
          <Link to="/Dashboard/invoices" className="mt-4 inline-block text-blue-600 font-medium hover:underline">← Back to Invoices</Link>
        </div>
      </div>
    );
  }

  const invoice = OneInvoiceState.data;
  const isVoid = invoice.status === 'VOID';
  const canVoidInvoice =
    canDelete('sales') && !isVoid && invoice.sale_id != null && Number.isFinite(Number(invoice.sale_id));
  const taxPercentage = invoice.company?.tax_percentage || 0;
  
  // Subtotal before discount (sum of unit_price * qty for all items)
  const subtotal = invoice.items?.reduce((acc, item) =>
    acc + (Number(item.unit_price) * item.quantity), 0) || 0;
  // Total discount: from invoice (multi-item) or sum of item discounts, else single sale discount
  const discount = invoice.total_discount_amount != null
    ? Number(invoice.total_discount_amount)
    : (invoice.items?.reduce((acc, item) => acc + Number(item.discount || 0), 0) ?? Number(invoice.product_sales?.sale_discount || 0));

  const tax = invoice.tax_amount !== undefined && invoice.tax_amount != null
    ? Number(invoice.tax_amount)
    : (subtotal - discount) * (taxPercentage / 100);

  const grandTotal = (subtotal - discount) + tax;
  // Multi-item: use total_paid_amount; single sale: use product_sales.received_amount
  const paidAmount = invoice.total_paid_amount != null && invoice.total_paid_amount !== undefined
    ? Number(invoice.total_paid_amount)
    : Number(invoice.product_sales?.received_amount || 0);
  const dueAmount = grandTotal - paidAmount;
  const isOverpaid = paidAmount > grandTotal;
  const hasBalanceDue = dueAmount > 0.01;
  const balanceDue = hasBalanceDue ? dueAmount : 0;

  const handlePrint = () => {
    const originalStyles = document.documentElement.style.background;
    document.documentElement.style.background = 'white';
    window.print();
    document.documentElement.style.background = originalStyles;
  };

  return (
    <div className="invoice-container w-full min-h-screen p-4 sm:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 text-black print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto">

        {/* Back button */}
        <div className="print:hidden mb-5">
          <Link
            to="/Dashboard/invoices"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors px-3 py-2 rounded-xl hover:bg-white/80"
          >
            <span className="text-base">&#8592;</span> Back to Invoices
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100/80 overflow-hidden print:shadow-none print:rounded-none print:border-0">

          {/* Header accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 print:hidden" />

          <div className="p-6 sm:p-10 flex flex-col text-slate-600">

            {/* ── Company header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {invoice.company?.company_name || 'Company'}
                </h1>
                {invoice.company?.company_address && (
                  <p className="text-sm text-slate-500 mt-1">{invoice.company.company_address}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-sm text-slate-500">
                  {invoice.company?.company_phone && <span>{invoice.company.company_phone}</span>}
                  {invoice.company?.company_email && <span>{invoice.company.company_email}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Invoice</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">#{invoice.invoice_number}</p>
              </div>
            </div>

            {/* ── Invoice meta + Customer ── */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
              <div className="space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20">Date:</span>
                  <span className="text-slate-700 font-medium">
                    {safeDate(invoice.issue_date) ? format(safeDate(invoice.issue_date)!, 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20">Status:</span>
                  {isVoid ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                      VOID
                    </span>
                  ) : (
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isOverpaid || !hasBalanceDue
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isOverpaid || !hasBalanceDue ? 'Paid' : 'Unpaid'}
                    </span>
                  )}
                </div>
              </div>
              {invoice.customer && (
                <div className="text-right text-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Bill To</p>
                  <p className="text-base font-semibold text-slate-800">{invoice.customer.customer_name}</p>
                  {invoice.customer.customer_address && invoice.customer.customer_address !== '—' && (
                    <p className="text-slate-500 mt-0.5">{invoice.customer.customer_address}</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Payment status badge ── */}
            {hasBalanceDue && (
              <div className="mb-6 py-2.5 px-5 rounded-xl bg-amber-50 border border-amber-200/60 w-fit">
                <p className="text-base font-semibold text-amber-800">
                  Balance Due: <span className="tabular-nums">${balanceDue.toFixed(2)}</span>
                </p>
              </div>
            )}

            {/* ── Items table ── */}
            <div className="mb-8 overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 print:bg-slate-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Item</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Qty</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoice.items?.map((item) => {
                    const lineTotal = Number(item.unit_price) * Number(item.quantity) - Number(item.discount || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-slate-700 font-medium">{item.product?.product_name}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">${Number(item.unit_price).toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">{Number(item.quantity)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-700 font-medium">${lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Summary ── */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80">
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="p-5 space-y-3 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="tabular-nums font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax{taxPercentage ? ` (${taxPercentage}%)` : ''}</span>
                        <span className="tabular-nums">${tax.toFixed(2)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Discount</span>
                        <span className="tabular-nums">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-bold text-slate-800">
                      <span>Grand Total</span>
                      <span className="tabular-nums">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-5 py-3.5 space-y-2 text-sm border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Paid</span>
                      <span className="tabular-nums text-emerald-600 font-semibold">${paidAmount.toFixed(2)}</span>
                    </div>
                    {hasBalanceDue && (
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-700">Balance Due</span>
                        <span className="tabular-nums text-red-600">${balanceDue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="mt-10 pt-5 border-t border-slate-100 text-center text-xs text-slate-400">
              <p className="font-medium text-slate-500">{invoice.company?.company_name}</p>
              <p className="mt-0.5">
                {[invoice.company?.company_address, invoice.company?.company_phone, invoice.company?.company_email]
                  .filter(Boolean)
                  .join('  |  ')}
              </p>
            </div>

            {/* Print + void (void uses sales:delete — same API as sale delete) */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all hover:shadow-md"
              >
                Print Invoice
              </button>
              {canVoidInvoice && (
                <button
                  type="button"
                  onClick={handleVoidInvoice}
                  disabled={delSaleState.isLoading}
                  className="px-8 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-medium text-sm hover:bg-red-100 disabled:opacity-60 disabled:pointer-events-none transition-colors"
                >
                  {delSaleState.isLoading ? 'Voiding…' : 'Void invoice'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
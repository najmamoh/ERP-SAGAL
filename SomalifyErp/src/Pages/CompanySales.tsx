import { FormEvent, useEffect, useMemo, useState } from 'react';
import { GoPlus } from "react-icons/go";
import { CiTrash } from "react-icons/ci";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import toast from 'react-hot-toast';
import { createSaleFn, resetSale } from '@/Redux/Slice/CreateSaleSlice';
import { getAllCustomerFn } from '@/Redux/Slice/AllCustomers';
import { getCompanyInventoryFn } from '@/Redux/Slice/CompanyInventorySlice';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
import { CreateCustomerModal } from '@/components/CreateCustomerModal';
import { CustomerDialog } from '@/components/SaleDrop';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BarcodeScannerWrapper from '@/components/Qrcode';

type FormField = 'sale_qty' | 'item_price' | 'sale_discount' | 'received_amount' | 'stock_id' | 'customer_id' | 'taxable_sale' | 'product_name' | 'original_price';

interface FormInput {
  sale_qty: string;
  item_price: string;
  sale_discount: string;
  original_price: string;
  received_amount: string;
  stock_id: string;
  customer_id: string;
  product_name: string;
  taxable_sale: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
  exit: { opacity: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 },
};

export function CompanySalesCreate() {
  const [createCustomerModalOpen, setCreateCustomerModalOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productDialogIndex, setProductDialogIndex] = useState(0);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const toastId = "saleid";
  const createSaleState = useSelector((state: RootState) => state.createSales);
  const AllCustomerState = useSelector((state: RootState) => state.AllCustomer);
  const CompanyInventoryState = useSelector((state: RootState) => state.companyInventory);
  const GetCompanyState = useSelector((state: RootState) => state.GetOneCompanay);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [customerPagination, setCustomerPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const [totalReceived, setTotalReceived] = useState('');

  const [formInputs, setFormInputs] = useState<FormInput[]>([
    {
      sale_qty: '1',
      item_price: '',
      sale_discount: '0',
      original_price: '',
      received_amount: '',
      stock_id: '',
      product_name: '',
      customer_id: '',
      taxable_sale: false,
    },
  ]);

  useEffect(() => {
    dispatch(getAllCustomerFn({ page: 1, pageSize: 20, search: '' }));
    dispatch(getCompanyInventoryFn()); // Load all inventory initially
    dispatch(getOneCompanayFN());
  }, [dispatch]);

  // When customer dialog opens, reset search and page
  useEffect(() => {
    if (customerDialogOpen) {
      setCustomerSearchTerm('');
      setCustomerPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [customerDialogOpen]);

  // When customer search term changes, reset to page 1
  useEffect(() => {
    setCustomerPagination(prev => ({ ...prev, page: 1 }));
  }, [customerSearchTerm]);

  // Fetch customers (company branch) when dialog is open or pagination/search changes. Debounce search.
  useEffect(() => {
    if (!customerDialogOpen) return;
    const timeoutId = setTimeout(() => {
      dispatch(getAllCustomerFn({
        page: customerPagination.page,
        pageSize: customerPagination.pageSize,
        search: customerSearchTerm.trim() || undefined
      }));
    }, customerSearchTerm ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [dispatch, customerPagination.page, customerPagination.pageSize, customerSearchTerm, customerDialogOpen]);

  // Sync customer pagination total from API response
  useEffect(() => {
    if (AllCustomerState?.total != null) {
      setCustomerPagination(prev => ({ ...prev, total: AllCustomerState.total }));
    }
  }, [AllCustomerState?.total]);

  // Debounced search for products - calls backend API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (productDialogOpen) {
        // Only search when dialog is open
        dispatch(getCompanyInventoryFn(productSearchTerm || undefined));
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [dispatch, productSearchTerm, productDialogOpen]);

  // Reset to all products when dialog opens
  useEffect(() => {
    if (productDialogOpen) {
      setProductSearchTerm('');
      dispatch(getCompanyInventoryFn()); // Load all products when dialog opens
    }
  }, [dispatch, productDialogOpen]);

  const Tax = (GetCompanyState.data?.tax_percentage || 0) / 100;
  // Per-row: line total needed (subtotal after discount + tax) and max discount (subtotal before discount)
  const getRowNeeded = (input: FormInput) => {
    const itemPrice = Number(input.item_price) || 0;
    const qty = Number(input.sale_qty) || 0;
    const discount = Number(input.sale_discount) || 0;
    const subtotal = itemPrice * qty - discount;
    const tax = input.taxable_sale ? subtotal * Tax : 0;
    return { lineTotal: subtotal + tax, maxDiscount: itemPrice * qty };
  };

  // Distribute total received across rows; total received must not exceed total needed
  const handleTotalReceivedChange = (value: string) => {
    setTotalReceived(value);
    if (!value || formInputs.length === 0) return;
    let totalVal = parseFloat(value);
    if (isNaN(totalVal) || totalVal < 0) return;

    const rowTotals = formInputs.map(input => getRowNeeded(input).lineTotal);
    const sumTotals = rowTotals.reduce((a, b) => a + b, 0);
    if (sumTotals <= 0) return;

    // No cap — market sellers may receive more than item price

    const updated = formInputs.map((input, i) => {
      const share = (rowTotals[i] / sumTotals) * totalVal;
      return { ...input, received_amount: share.toFixed(2) };
    });
    setFormInputs(updated);
  };

  const handleAddNewInput = () => {
    const currentCustomerId = formInputs[0]?.customer_id || '';
    setFormInputs([
      ...formInputs,
      {
        sale_qty: '1',
        item_price: '',
        sale_discount: '0',
        received_amount: '',
        original_price: '',
        stock_id: '',
        product_name: '',
        customer_id: currentCustomerId,
        taxable_sale: false,
      },
    ]);
  };

  const handleInputChange = (index: number, field: FormField, value: string | boolean) => {
    if (field === 'customer_id') {
      const updatedInputs = formInputs.map(input => ({
        ...input,
        customer_id: value.toString()
      }));
      setFormInputs(updatedInputs);
      return;
    }
    const input = formInputs[index];
    if (field === 'sale_discount') {
      const num = parseFloat(String(value));
      if (!isNaN(num) && num >= 0) {
        const { maxDiscount } = getRowNeeded(input);
        const capped = Math.min(num, maxDiscount);
        if (capped !== num) value = String(capped);
      }
    }
    if (field === 'received_amount') {
      const num = parseFloat(String(value));
      if (!isNaN(num) && num < 0) value = '0';
    }
    const updatedInputs: FormInput[] = [...formInputs];
    updatedInputs[index][field as keyof FormInput] = value as never;

    // When qty or unit price changes, auto-fill received amount to (qty × price) so e.g. 0.5 qty = half price
    if (field === 'sale_qty' || field === 'item_price') {
      const qty = field === 'sale_qty' ? parseFloat(String(value).replace(',', '.')) : Number(updatedInputs[index].sale_qty) || 0;
      const price = field === 'item_price' ? parseFloat(String(value).replace(',', '.')) : Number(updatedInputs[index].item_price) || 0;
      if (!isNaN(qty) && qty > 0 && !isNaN(price) && price >= 0) {
        const lineTotal = qty * price;
        updatedInputs[index].received_amount = lineTotal.toFixed(2);
      }
    }

    setFormInputs(updatedInputs);
  };

  const handleCustomerSelect = (customerId: string) => {
    handleInputChange(0, 'customer_id', customerId);
    setCustomerDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const updatedInputs = [...formInputs];
    updatedInputs.splice(index, 1);
    setFormInputs(updatedInputs);
  };

  useEffect(() => {
    if (CompanyInventoryState?.data) {
      const updatedInputs = formInputs.map(input => {
        const selectedStock = CompanyInventoryState.data.find(stock => stock.stock_id === +input.stock_id);
        if (selectedStock) {
          const price = toPriceStr(selectedStock.product.product_price);
          if (input.item_price !== price) {
            return { ...input, item_price: price, original_price: price };
          }
        }
        return input;
      });
      setFormInputs(updatedInputs);
    }
  }, [CompanyInventoryState, formInputs]);

  // Normalize price from API (Prisma Decimal can be object - ensure numeric string)
  const toPriceStr = (val: unknown): string => {
    const n = typeof val === 'object' && val != null && 'toString' in val
      ? parseFloat((val as { toString: () => string }).toString())
      : Number(val);
    return isNaN(n) ? '' : String(n);
  };

  const handleStockChange = (index: number, stock_id: string) => {
    const selectedStock = CompanyInventoryState.data.find(
      stock => stock.stock_id === +stock_id
    );
    if (selectedStock) {
      const price = toPriceStr(selectedStock.product.product_price);
      handleInputChange(index, 'item_price', price);
      handleInputChange(index, 'product_name', selectedStock.product.product_name ?? '');
      handleInputChange(index, 'original_price', price);
    }
    handleInputChange(index, 'stock_id', stock_id);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const hasErrors = formInputs.some((input, index) => {
      if (!input.stock_id || input.stock_id.trim() === '') {
        toast.error(`Row ${index + 1}: Please select a product`);
        return true;
      }
      if (!input.sale_qty || Number(input.sale_qty) <= 0) {
        toast.error(`Row ${index + 1}: Quantity must be greater than 0`);
        return true;
      }
      if (!input.item_price || +input.item_price <= 0) {
        toast.error(`Row ${index + 1}: Price must be greater than 0`);
        return true;
      }
      if (!input.received_amount || input.received_amount.trim() === '') {
        toast.error(`Row ${index + 1}: Received amount is required`);
        return true;
      }
      if (+input.received_amount < 0) {
        toast.error(`Row ${index + 1}: Received amount cannot be negative`);
        return true;
      }
      return false;
    });
    if (hasErrors) return;

    const sumDiscount = formInputs.reduce((acc, i) => acc + (Number(i.sale_discount) || 0), 0);
    const maxDiscountAllowed = formInputs.reduce((acc, i) => acc + getRowNeeded(i).maxDiscount, 0);
    if (sumDiscount > maxDiscountAllowed) {
      toast.error(`Total discount cannot exceed total line subtotals ($${maxDiscountAllowed.toFixed(2)})`);
      return;
    }

    const saleData = formInputs.map(input => ({
      sale_qty: Number(input.sale_qty),
      item_price: String(Number(input.item_price) || 0),
      sale_discount: input.sale_discount || '0',
      received_amount: String(Number(input.received_amount) || 0),
      stock_id: +input.stock_id,
      customer_id: input.customer_id ? +input.customer_id : null,
      taxable_sale: Boolean(input.taxable_sale)
    }));
    dispatch(createSaleFn(saleData));
  };

  useEffect(() => {
    if (createSaleState.isLoading) toast.loading('Creating sale...', { id: toastId });
    if (createSaleState.IsSuccess) {
      toast.success('Sale created successfully', { id: toastId });
      dispatch(resetSale());
      setTotalReceived('');
      setFormInputs([{
        sale_qty: '1',
        item_price: '',
        sale_discount: '0',
        original_price: '',
        received_amount: '',
        stock_id: '',
        product_name: '',
        customer_id: '',
        taxable_sale: false,
      }]);
    }
    if (createSaleState.isError) {
      toast.error(createSaleState.errorMsg, { id: toastId });
      dispatch(resetSale());
    }
  }, [createSaleState.IsSuccess, createSaleState.isLoading, createSaleState.isError, createSaleState.errorMsg, dispatch]);

  const handleProductScan = (err: any, result: any) => {
    if (result) {
      const scannedCode = result.getText();
      setProductSearchTerm(scannedCode);
      // Backend will filter, and if exact match found in results, auto-select
      // Check after a short delay for backend response
      setTimeout(() => {
        const exactMatch = CompanyInventoryState.data.find(
          item => item.product.product_code === scannedCode
        );
        if (exactMatch) {
          handleStockChange(productDialogIndex, exactMatch.stock_id.toString());
          setProductDialogOpen(false);
          setProductSearchTerm('');
        }
      }, 500);
    }
    if (err) {
      console.error('Scan error:', err);
    }
  };

  const total = useMemo(() => {
    return formInputs.reduce((acc, input) => {
      const itemPrice = Number(input.item_price) || 0;
      const qty = Number(input.sale_qty) || 0;
      const discount = Number(input.sale_discount) || 0;
      const subtotal = itemPrice * qty - discount;
      const tax = input.taxable_sale ? subtotal * Tax : 0;
      return acc + subtotal + tax;
    }, 0);
  }, [formInputs, Tax]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20">
      <div className="w-full overflow-auto">
          <motion.div
            className="w-full max-w-7xl 2xl:max-w-[90rem] mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-4 sm:py-6 md:py-8 lg:py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <motion.header
              className="mb-6 sm:mb-8 lg:mb-10"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 lg:gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-slate-800 to-indigo-700 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent break-words">
                    New Sale
                  </h1>
                  <p className="mt-1 text-xs xs:text-sm sm:text-base text-slate-500 dark:text-slate-400">
                    Add items from your company inventory and complete the sale
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setCreateCustomerModalOpen(true)}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 xs:px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs xs:text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GoPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Create Customer</span>
                    <span className="xs:hidden">Customer</span>
                  </motion.button>
                  <Link to="/Dashboard/Sales/Lists" className="flex-shrink-0">
                    <motion.span
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 xs:px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs xs:text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 transition-colors whitespace-nowrap"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Sales
                    </motion.span>
                  </Link>
                </div>
              </div>
            </motion.header>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
              {/* Live total card and total received (for multi-product single sale) */}
              <motion.div
                className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 p-[1px] shadow-xl shadow-indigo-500/20"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800/95 px-4 xs:px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs xs:text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">Total</span>
                    {formInputs.length > 1 && (
                      <label className="text-[10px] xs:text-xs text-slate-400 dark:text-slate-500">
                        Total received (splits across rows)
                      </label>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                    {formInputs.length > 1 && (
                      <input
                        type="text"
                        inputMode="decimal"
                        value={totalReceived}
                        onChange={(e) => handleTotalReceivedChange(e.target.value)}
                        placeholder="Amount received"
                        className="w-28 xs:w-32 sm:w-36 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                    <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tabular-nums text-slate-800 dark:text-white">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Product rows */}
              <motion.div
                className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {formInputs.map((input, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      layout
                      exit="exit"
                      className="rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-gray-600/80 bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7">
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                          <div className="flex flex-col xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-2">
                            <label className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Product</label>
                            <input
                              type="text"
                              readOnly
                              value={input.product_name || ''}
                              onClick={() => {
                                setProductDialogIndex(index);
                                setProductSearchTerm('');
                                setProductDialogOpen(true);
                              }}
                              placeholder="Click to select product"
                              className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs xs:text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-600"
                            />
                          </div>
                          <div className="flex flex-col xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-2">
                            <label className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Product name</label>
                            <input
                              type="text"
                              value={input.product_name || ''}
                              readOnly
                              placeholder="—"
                              className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 text-xs xs:text-sm"
                            />
                          </div>
                          <div className="flex flex-col xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                            <label className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Qty</label>
                            <input
                              type="number"
                              value={input.sale_qty}
                              onChange={(e) => handleInputChange(index, 'sale_qty', e.target.value)}
                              min="0.01"
                              step="any"
                              required
                              className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs xs:text-sm"
                            />
                          </div>
                          <div className="flex flex-col xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                            <label className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Price</label>
                            <input
                              type="text"
                              value={input.item_price}
                              onChange={(e) => handleInputChange(index, 'item_price', e.target.value)}
                              placeholder="Enter price"
                              className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs xs:text-sm"
                            />
                          </div>
                          <div className="flex flex-col xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                            <label className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Discount</label>
                            <input
                              type="text"
                              value={input.sale_discount}
                              onChange={(e) => handleInputChange(index, 'sale_discount', e.target.value)}
                              placeholder="0"
                              className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-xs xs:text-sm"
                            />
                          </div>
                          <div className="flex flex-col xs:col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                            <label className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Received amount *</label>
                            <input
                              type="text"
                              value={input.received_amount}
                              onChange={(e) => handleInputChange(index, 'received_amount', e.target.value)}
                              placeholder="Amount received"
                              required
                              className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-xs xs:text-sm"
                            />
                          </div>
                          <div className="flex flex-col xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</label>
                              <button
                                type="button"
                                onClick={() => setCreateCustomerModalOpen(true)}
                                className="text-[10px] xs:text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                              >
                                + New
                              </button>
                            </div>
                            <input
                              type="text"
                              readOnly
                              onClick={() => setCustomerDialogOpen(true)}
                              value={
                                input.customer_id
                                  ? (AllCustomerState.data?.find(c => c.customer_id === +input.customer_id)?.customer_name ?? 'Select customer')
                                  : 'Click to search customer'
                              }
                              placeholder="Click to search customer"
                              className="w-full px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-xs xs:text-sm cursor-pointer"
                            />
                            <CustomerDialog
                              isOpen={customerDialogOpen}
                              onClose={() => setCustomerDialogOpen(false)}
                              customers={AllCustomerState.data || []}
                              searchTerm={customerSearchTerm}
                              setSearchTerm={setCustomerSearchTerm}
                              onSelectCustomer={handleCustomerSelect}
                              pagination={{
                                page: customerPagination.page,
                                pageSize: customerPagination.pageSize,
                                total: AllCustomerState.total ?? 0
                              }}
                              setPagination={setCustomerPagination}
                              isLoading={AllCustomerState.isLoading}
                            />
                          </div>
                          <div className="flex flex-col justify-end xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                            <label className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Tax</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={input.taxable_sale}
                                onChange={(e) => handleInputChange(index, 'taxable_sale', e.target.checked)}
                                className="w-3.5 h-3.5 xs:w-4 xs:h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-xs xs:text-sm text-slate-600 dark:text-slate-400">Apply tax</span>
                            </label>
                          </div>
                          {formInputs.length > 1 && (
                            <div className="flex items-end xs:col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                              <motion.button
                                type="button"
                                onClick={() => handleDelete(index)}
                                className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs xs:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors w-full xs:w-auto justify-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <CiTrash className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                                <span className="hidden xs:inline">Remove</span>
                                <span className="xs:hidden">Delete</span>
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-2 sm:pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  type="button"
                  onClick={handleAddNewInput}
                  className="inline-flex items-center justify-center gap-1.5 xs:gap-2 px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs xs:text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GoPlus className="w-4 h-4 xs:w-5 xs:h-5" />
                  <span className="hidden xs:inline">Add another item</span>
                  <span className="xs:hidden">Add item</span>
                </motion.button>
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 w-full sm:w-auto">
                  <motion.button
                    type="button"
                    onClick={() => navigate('/Dashboard/Sales/Lists')}
                    className="px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs xs:text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors w-full xs:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={createSaleState.isLoading}
                    className="px-5 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs xs:text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed w-full xs:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {createSaleState.isLoading ? 'Creating…' : 'Complete sale'}
                  </motion.button>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
      <CreateCustomerModal
        isOpen={createCustomerModalOpen}
        onClose={() => setCreateCustomerModalOpen(false)}
        onSuccess={() => {
          dispatch(getAllCustomerFn({
            page: customerPagination.page,
            pageSize: customerPagination.pageSize,
            search: customerSearchTerm
          }));
        }}
      />

      {/* Product Selection Dialog */}
      <Dialog 
        open={productDialogOpen} 
        onOpenChange={(open) => {
          setProductDialogOpen(open);
          if (!open) {
            // Reset search and reload all products when dialog closes
            setProductSearchTerm('');
            dispatch(getCompanyInventoryFn());
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 text-black dark:text-white flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Select Product</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Search by product name/code or scan barcode/QR code
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="flex gap-2">
              <Input
                placeholder="Search or scan barcode/QR code"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                autoFocus
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => setTorchOn(!torchOn)}
                variant="outline"
                className="whitespace-nowrap"
              >
                {torchOn ? '🔦 Torch Off' : '🔦 Torch On'}
              </Button>
            </div>

            <div className="relative h-64 bg-black rounded-lg overflow-hidden">
              <BarcodeScannerWrapper
                width={600}
                height={400}
                torch={torchOn}
                onUpdate={handleProductScan}
                formats={[
                  'QR_CODE',
                  'CODE_128',
                  'EAN_13',
                  'UPC_A',
                  'UPC_E',
                  'EAN_8',
                  'CODE_39',
                ]}
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-2 pr-2">
                {CompanyInventoryState.isLoading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Searching...
                  </div>
                ) : CompanyInventoryState.data.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {productSearchTerm 
                      ? 'No products found. Try a different search term or scan a barcode.'
                      : 'No products available in inventory.'}
                  </div>
                ) : (
                  CompanyInventoryState.data.map((stock) => (
                    <div
                      key={stock.stock_id}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                      onClick={() => {
                        handleStockChange(productDialogIndex, stock.stock_id.toString());
                        setProductDialogOpen(false);
                        setProductSearchTerm('');
                        dispatch(getCompanyInventoryFn()); // Reset to all products
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {stock.product.product_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Code: {stock.product.product_code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${Number(stock.product.product_price).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Stock: {stock.quantity}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setProductDialogOpen(false);
                  setProductSearchTerm('');
                  dispatch(getCompanyInventoryFn()); // Reset to all products
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CompanySalesCreate;

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createSaleFn, resetSale } from '@/Redux/Slice/CreateSaleSlice';
import { getAllPurchasesFn } from '@/Redux/Slice/AllPurchases';
import { getAllCustomerFn } from '@/Redux/Slice/AllCustomers';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
import { CustomerDialog, DialogDemo } from '@/components/SaleDrop';
import { SearchAllPurchasesSortFn } from '@/Redux/SearhPurchaseSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import { motion } from 'framer-motion';

interface SalesFormProps {
  onSuccess?: () => void;
}

type FormField = 'sale_qty' | 'item_price' | 'sale_discount' | 'received_amount' | 'purchase_id' | 'customer_id' | 'taxable_sale' | 'product_name' | 'original_price';

interface FormInput {
  sale_qty: string;
  item_price: string;
  sale_discount: string;
  original_price: string;
  received_amount: string;
  purchase_id: string;
  customer_id: string;
  product_name: string;
  taxable_sale: boolean;
}

export function SalesForm({ onSuccess }: SalesFormProps) {
  const toastId = "saleid";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const createSaleState = useSelector((state: RootState) => state.createSales);
  const AllCustomerState = useSelector((state: RootState) => state.AllCustomer);
  const AllPurchaseNormalState = useSelector((state: RootState) => state.AllPurchases);
  const SearchPurchaseState = useSelector((state: RootState) => state.searchPuSearchAllpurchases);
  const GetCompanyState = useSelector((state: RootState) => state.GetOneCompanay);

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  const [customerPagination, setCustomerPagination] = useState({
    page: 1,
    pageSize: 20,
    total: AllCustomerState.total || 0,
  });

  const [formInputs, setFormInputs] = useState<FormInput[]>([
    {
      sale_qty: '',
      item_price: '',
      sale_discount: '0',
      original_price: '',
      received_amount: '',
      purchase_id: '',
      product_name: '',
      customer_id: '',
      taxable_sale: false,
    },
  ]);

  useEffect(() => {
    dispatch(getAllCustomerFn({ page: 1, pageSize: 20, search: '' }));
    dispatch(getAllPurchasesFn());
    dispatch(SearchAllPurchasesSortFn({ page: 1, pageSize: 20, search: '' }));
    dispatch(getOneCompanayFN());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllCustomerFn({
      page: customerPagination.page,
      pageSize: customerPagination.pageSize,
      search: customerSearchTerm
    }));
  }, [dispatch, customerPagination.page, customerPagination.pageSize, customerSearchTerm]);

  const isCompanyDashboard = location.pathname.startsWith('/Dashboard');
  const companyId = GetCompanyState.data?.company_id ?? JSON.parse(localStorage.getItem('userInfo') || '{}')?.company_id ?? JSON.parse(localStorage.getItem('userInfo') || '{}')?.user?.company_id;

  useEffect(() => {
    dispatch(SearchAllPurchasesSortFn({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchTerm,
      ...(isCompanyDashboard && companyId ? { company_id: companyId } : {}),
    }));
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm, isCompanyDashboard, companyId]);

  useEffect(() => {
    if (createSaleState.isLoading) {
      toast.loading('Creating Sale...', { id: toastId });
    }
    if (createSaleState.IsSuccess) {
      toast.success('Successfully created.', { id: toastId });
      const basePath = location.pathname.includes('/AdminDashboard') ? '/AdminDashboard' : '/Dashboard';
      navigate(`${basePath}/SaleReceipt`, { state: { salesData: formInputs } });
      setTimeout(() => {
        dispatch(resetSale());
        onSuccess?.();
      }, 500);
    }
    if (createSaleState.isError) {
      toast.error(createSaleState.errorMsg, { id: toastId });
      dispatch(resetSale());
    }
  }, [createSaleState.IsSuccess, createSaleState.isLoading, createSaleState.isError, dispatch, navigate, formInputs, location.pathname, onSuccess]);

  useEffect(() => {
    if (AllPurchaseNormalState?.data) {
      const updatedInputs = formInputs.map(input => {
        const selectedPurchase = AllPurchaseNormalState.data.find(purchase => purchase.purchase_id === +input.purchase_id);
        if (selectedPurchase && input.item_price !== selectedPurchase.products.product_price) {
          return {
            ...input,
            item_price: selectedPurchase.products.product_price,
            original_price: selectedPurchase.products.product_price,
          };
        }
        return input;
      });

      if (JSON.stringify(updatedInputs) !== JSON.stringify(formInputs)) {
        setFormInputs(updatedInputs);
      }
    }
  }, [AllPurchaseNormalState, formInputs]);

  const handleAddNewInput = () => {
    const currentCustomerId = formInputs[0]?.customer_id || '';
    setFormInputs([
      ...formInputs,
      {
        sale_qty: '',
        item_price: '',
        sale_discount: '0',
        received_amount: '',
        original_price: '',
        purchase_id: '',
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
    } else {
      const updatedInputs: FormInput[] = [...formInputs];
      updatedInputs[index][field as keyof FormInput] = value as never;
      setFormInputs(updatedInputs);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const updatedInputs = formInputs.map(input => ({
      ...input,
      customer_id: customerId
    }));
    setFormInputs(updatedInputs);
    setCustomerDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const updatedInputs = [...formInputs];
    updatedInputs.splice(index, 1);
    setFormInputs(updatedInputs);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result as string;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const formattedData = data.slice(1).map((row: any) => {
        const [sale_qty, item_price, sale_discount, received_amount, purchase_id, customer_id, taxable_sale, product_name, , original_price] = row;
        return {
          sale_qty: sale_qty?.toString() || '',
          item_price: item_price?.toString() || '',
          sale_discount: sale_discount?.toString() || '0',
          received_amount: received_amount?.toString() || '',
          purchase_id: purchase_id?.toString() || '',
          customer_id: customer_id?.toString() || '',
          product_name: product_name?.toString() || '',
          original_price: original_price?.toString() || '',
          taxable_sale: taxable_sale ? (taxable_sale.toString().toLowerCase() === 'true') : false
        };
      });

      const customerIds = formattedData.map(input => input.customer_id);
      const uniqueCustomerIds = [...new Set(customerIds)];
      if (uniqueCustomerIds.length > 1) {
        toast.error('All sales must have the same customer or all null.');
        return;
      }

      setFormInputs(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const handlePurchaseChange = (index: number, purchase_id: string) => {
    const selectedPurchase = SearchPurchaseState.data.find(
      purchase => purchase.purchase_id === +purchase_id
    );

    if (selectedPurchase) {
      handleInputChange(index, 'item_price', selectedPurchase.products.product_price);
      handleInputChange(index, 'product_name', selectedPurchase.products.product_name);
      handleInputChange(index, 'original_price', selectedPurchase.products.product_price);
    }
    handleInputChange(index, 'purchase_id', purchase_id);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const hasErrors = formInputs.some((input, index) => {
      if (!input.purchase_id || input.purchase_id.trim() === '') {
        toast.error(`Row ${index + 1}: Please select a product`);
        return true;
      }
      if (!input.sale_qty || Number(input.sale_qty) <= 0) {
        toast.error(`Row ${index + 1}: Quantity must be greater than 0`);
        return true;
      }
      if (!input.item_price || +input.item_price <= 0) {
        toast.error(`Row ${index + 1}: Item price must be greater than 0`);
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

    if (hasErrors) {
      return;
    }

    const formData = formInputs.map((input) => {
      const saleData: any = {
        sale_qty: Number(input.sale_qty),
        item_price: input.item_price,
        sale_discount: input.sale_discount || '0',
        received_amount: input.received_amount,
        purchase_id: +input.purchase_id,
        taxable_sale: input.taxable_sale || false
      };

      if (input.customer_id && input.customer_id.trim() !== '' && !isNaN(+input.customer_id) && +input.customer_id > 0) {
        saleData.customer_id = +input.customer_id;
      }

      return saleData;
    });

    dispatch(createSaleFn(formData));
  };

  const Tax = (GetCompanyState.data?.tax_percentage || 0) / 100;
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <p className='text-lg font-bold text-gray-900 dark:text-white'>Total: {total.toFixed(2)}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-indigo-600 px-4 py-2 gap-2 flex items-center text-white rounded-[5px] hover:bg-indigo-700 transition-colors"
              onClick={() => document.getElementById('excel-import')?.click()}
            >
              <CiImport className="text-lg" />
              Import Excel
            </button>
            <input
              id="excel-import"
              type="file"
              accept=".csv, .xlsx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="px-4 py-2 flex gap-2 items-center bg-gray-100 dark:bg-gray-700 rounded-[5px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={handleAddNewInput}
            >
              <GoPlus className="text-lg" />
              Add New
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {formInputs.map((input, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Product
                  </label>
                  <input
                    type="text"
                    readOnly
                    onClick={() => {
                      setCurrentDialogIndex(index);
                      setDialogOpen(true);
                    }}
                    value={input.product_name || ''}
                    placeholder="Click to select product"
                    className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <DialogDemo
                    isOpen={dialogOpen && currentDialogIndex === index}
                    onClose={() => setDialogOpen(false)}
                    purchases={SearchPurchaseState.data}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSelectPurchase={(purchaseId) => {
                      handlePurchaseChange(index, purchaseId);
                      setDialogOpen(false);
                    }}
                    pagination={{
                      page: pagination.page,
                      pageSize: pagination.pageSize,
                      total: SearchPurchaseState.total
                    }}
                    setPagination={setPagination}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Price
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={input.item_price}
                    onChange={(e) => handleInputChange(index, 'item_price', e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={input.sale_qty}
                    onChange={(e) => handleInputChange(index, 'sale_qty', e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sales Discount
                  </label>
                  <input
                    type="tel"
                    className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={input.sale_discount}
                    onChange={(e) => handleInputChange(index, 'sale_discount', e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Received Amount
                  </label>
                  <input
                    type="tel"
                    className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={input.received_amount}
                    onChange={(e) => handleInputChange(index, 'received_amount', e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer
                  </label>
                  <input
                    type="text"
                    readOnly
                    onClick={() => setCustomerDialogOpen(true)}
                    value={
                      input.customer_id
                        ? AllCustomerState.data?.find(c => c.customer_id === +input.customer_id)?.customer_name
                        : 'Select Customer'
                    }
                    placeholder="Click to select customer"
                    className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      total: AllCustomerState.total || 0
                    }}
                    setPagination={setCustomerPagination}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax
                  </label>
                  <select
                    value={String(input.taxable_sale)}
                    onChange={(e) => handleInputChange(index, 'taxable_sale', e.target.value === 'true')}
                    className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              {/* Tax Details - Show when Tax is Yes */}
              {input.taxable_sale && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span>📊</span>
                    Tax Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Tax Percentage
                      </label>
                      <div className="border border-blue-300 dark:border-blue-700 rounded-[5px] p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        {((GetCompanyState.data?.tax_percentage || 0)).toFixed(2)}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        From company settings
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Tax Amount
                      </label>
                      <div className="border border-blue-300 dark:border-blue-700 rounded-[5px] p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
                        ${(() => {
                          const itemPrice = Number(input.item_price) || 0;
                          const qty = Number(input.sale_qty) || 0;
                          const discount = Number(input.sale_discount) || 0;
                          const subtotal = itemPrice * qty - discount;
                          const taxAmount = subtotal * Tax;
                          return taxAmount.toFixed(2);
                        })()}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Calculated automatically
                      </p>
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Subtotal (Before Tax)
                      </label>
                      <div className="border border-blue-300 dark:border-blue-700 rounded-[5px] p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        ${(() => {
                          const itemPrice = Number(input.item_price) || 0;
                          const qty = Number(input.sale_qty) || 0;
                          const discount = Number(input.sale_discount) || 0;
                          return (itemPrice * qty - discount).toFixed(2);
                        })()}
                      </div>
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Total (After Tax)
                      </label>
                      <div className="border border-blue-300 dark:border-blue-700 rounded-[5px] p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg">
                        ${(() => {
                          const itemPrice = Number(input.item_price) || 0;
                          const qty = Number(input.sale_qty) || 0;
                          const discount = Number(input.sale_discount) || 0;
                          const subtotal = itemPrice * qty - discount;
                          const taxAmount = subtotal * Tax;
                          return (subtotal + taxAmount).toFixed(2);
                        })()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {formInputs.length > 1 && (
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 flex items-center gap-2 rounded-[5px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={() => handleDelete(index)}
                  >
                    <CiTrash />
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="soft-submit"
          >
            Create Sale
          </button>
        </div>
      </div>
    </form>
  );
}

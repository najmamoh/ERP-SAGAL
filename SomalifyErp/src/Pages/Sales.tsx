import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import toast from 'react-hot-toast';
import { createSaleFn, resetSale } from '@/Redux/Slice/CreateSaleSlice';
import { getAllPurchasesFn } from '@/Redux/Slice/AllPurchases';
import { getAllCustomerFn } from '@/Redux/Slice/AllCustomers';
// import { getAllVendorsFn } from '@/Redux/Slice/GetAllVendor';
import { FcSalesPerformance } from 'react-icons/fc';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
// import { useQRCodeScanner } from '@/components/Qrcode';
import { CustomerDialog, DialogDemo } from '@/components/SaleDrop';
import { SearchAllPurchasesSortFn } from '@/Redux/SearhPurchaseSlice';





export function SAlesCreate() {


  
  const [searchTerm, setSearchTerm] = useState('');


  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRowIndex, setDialogRowIndex] = useState(0);

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
const [customerSearchTerm, setCustomerSearchTerm] = useState('');


// Update the customer pagination state


  
  const toastId = "saleid";
  const createSaleState = useSelector((state: RootState) => state.createSales);
  const AllCustomerState = useSelector((state: RootState) => state.AllCustomer);
  const AllPurchaseNormalState = useSelector((state: RootState) => state.AllPurchases);
  const SearchPurchaseState = useSelector((state: RootState) => state.searchPuSearchAllpurchases);
  const  GetCompanyState= useSelector((state:RootState)=> state.GetOneCompanay)

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // dispatch(getAllVendorsFn());
    dispatch(getAllCustomerFn({ page: 1, pageSize: 20, search: '' }));
    dispatch(getAllPurchasesFn());
    dispatch(SearchAllPurchasesSortFn({ page: 1, pageSize: 20, search: '' }));
  }, [dispatch]);

  // Add pagination state
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

  useEffect(() => {
    dispatch(getAllCustomerFn({
      page: customerPagination.page,
      pageSize: customerPagination.pageSize,
      search: customerSearchTerm
    }));
  }, [dispatch, customerPagination.page, customerPagination.pageSize, customerSearchTerm]);
  // Search effect
  useEffect(() => {
    dispatch(SearchAllPurchasesSortFn({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchTerm
    }));
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm]);
  
  // Form types and state (must be declared before useEffect that uses formInputs)
  type FormField = 'sale_qty' | 'item_price' | 'sale_discount' | 'received_amount' | 'purchase_id' | 'customer_id' | 'taxable_sale'| 'product_name'|'original_price';

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

  const [formInputs, setFormInputs] = useState<FormInput[]>([
    {
      sale_qty: '',
      item_price: '',
      sale_discount: '0',
      original_price: '',
      received_amount: '',
      purchase_id: '',
      product_name:'',
      customer_id: '',
      taxable_sale: false,
    },
  ]);

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
      }, 500);
    }
    if (createSaleState.isError) {
      toast.error(createSaleState.errorMsg, { id: toastId });
      dispatch(resetSale());
    }
  }, [createSaleState.IsSuccess, createSaleState.isLoading, createSaleState.isError, dispatch, navigate, formInputs]);

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
        product_name:'',
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
        const [sale_qty, item_price, sale_discount, received_amount, purchase_id, customer_id, taxable_sale, product_name,,original_price] = row;
        return {
          sale_qty: sale_qty?.toString() || '',
          item_price: item_price?.toString() || '',
          sale_discount: sale_discount?.toString() || '',
          received_amount: received_amount?.toString() || '',
          purchase_id: purchase_id?.toString() || '',
          customer_id: customer_id?.toString() || '',
          product_name: product_name?.toString() || '',
          original_price:original_price?.toString()||'',
          taxable_sale: taxable_sale ? (taxable_sale.toString().toLowerCase() === 'true') : false
        };
      });
      
  
      // Check if all customer IDs are the same
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
  
      // Only update if something has changed
      if (JSON.stringify(updatedInputs) !== JSON.stringify(formInputs)) {
        setFormInputs(updatedInputs);
      }
    }
  }, [AllPurchaseNormalState, formInputs]);

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

    // Validate required fields
    const hasErrors = formInputs.some((input, index) => {
      if (!input.purchase_id || input.purchase_id.trim() === '') {
        toast.error(`Row ${index + 1}: Please select a product`);
        return true;
      }
      if (!input.sale_qty || Number(input.sale_qty) <= 0) {
        toast.error(`Row ${index + 1}: Quantity must be greater than 0 (e.g. 0.3, 1, 2.5)`);
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

      // Only include customer_id if it's a valid number
      if (input.customer_id && input.customer_id.trim() !== '' && !isNaN(+input.customer_id) && +input.customer_id > 0) {
        saleData.customer_id = +input.customer_id;
      }

      return saleData;
    });

    dispatch(createSaleFn(formData))
  };
   useEffect(()=>{
         dispatch(getOneCompanayFN());
       },[])
       
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

    
        
       // Add QR Scanner hook
       

  const basePath = location.pathname.includes('/AdminDashboard') ? '/AdminDashboard' : '/Dashboard';

  const inputBase = 'soft-field';
  const labelBase = 'soft-label';
  const btnPrimary = 'soft-submit';
  const btnSecondary = 'soft-btn-secondary';

  return (
    <div className="soft-page">
      <div className="p-3 flex items-center justify-between" />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card */}
        <div className="soft-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#605BFF] dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
                <FcSalesPerformance className="text-2xl" />
              </div>
              <div>
                <h1 className="soft-title">Create Sale</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Add products and process a new sale
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link to="Lists">
                <button type="button" className={btnSecondary}>
                  <FcSalesPerformance className="text-lg" />
                  All Sales
                </button>
              </Link>
              <Link to={`${basePath}/Sales/CreateCustomer`}>
                <button type="button" className={btnPrimary}>
                  <GoPlus className="text-lg" />
                  Create Customer
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="soft-card">
          <div className="p-6 sm:p-8">
          <div className="flex flex-wrap my-5 gap-3 justify-end items-center">
            <p className="text-lg font-bold text-slate-800 dark:text-white">Total: {total.toFixed(2)}</p>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => document.getElementById('excel-import')!.click()}
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
              className={btnSecondary}
              onClick={handleAddNewInput}
            >
              <GoPlus className="text-lg" />
              Add new
            </button>
          </div>
          {formInputs.map((input, index) => (
            <div key={index} className="mb-6">
              <div className="formdiv flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <label className={labelBase}>Product name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input.product_name || ''}
                        onChange={(e) => handleInputChange(index, 'product_name', e.target.value)}
                        placeholder="Type or select product"
                        className={`${inputBase} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => { setDialogRowIndex(index); setDialogOpen(true); }}
                        className={btnSecondary + ' whitespace-nowrap'}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                   
                  {/* <div className="flex flex-col ">
                    <label htmlFor="">Select purchase</label>
                    <select
                      value={input.purchase_id}
                      onChange={(e) => handlePurchaseChange(index, e.target.value)}
                      className="border border-gray-400 rounded-[10px] p-2">
                      <option>Select</option>
                      {AllPurchaseNormalState?.data?.map((purchase) => (
                        <option key={purchase.purchase_id} value={purchase.purchase_id}>
                          <div className='flex gap-3 justify-around'>
                            <span>{purchase.purchase_id}</span>
                            {purchase.products.product_name}
                            <span> </span>
                            <span>Quantity {purchase.purchase_qty}</span>
                          </div>
                        </option>
                      ))}
                    </select>
                  </div> */}
                  <div className="flex flex-col">
                    <label className={labelBase}>Item price</label>
                    <input
                      type="text"
                      className={inputBase}
                      value={input.item_price}
                      onChange={(e) => handleInputChange(index, 'item_price', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelBase}>Quantity</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      className={inputBase}
                      value={input.sale_qty}
                      onChange={(e) => handleInputChange(index, 'sale_qty', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelBase}>Sales Discount</label>
                    <input
                      type="tel"
                      className={inputBase}
                      value={input.sale_discount}
                      onChange={(e) => handleInputChange(index, 'sale_discount', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelBase}>Received Amount</label>
                    <input
                      type="tel"
                      className={inputBase}
                      value={input.received_amount}
                      onChange={(e) => handleInputChange(index, 'received_amount', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelBase}>Customer</label>
                    <input
                      type="text"
                      readOnly
                      onClick={() => setCustomerDialogOpen(true)}
                      value={
                        AllCustomerState.isLoading
                          ? 'Loading...'
                          : formInputs[index].customer_id
                            ? (AllCustomerState.data?.find(c => c.customer_id === +formInputs[index].customer_id)?.customer_name ?? 'Select Customer')
                            : 'Select Customer'
                      }
                      placeholder="Click to select customer"
                      className={`${inputBase} cursor-pointer`}
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
                      isLoading={AllCustomerState.isLoading}
                    />
                  </div>

  

                  
                  <div className="flex flex-col">
                    <label className={labelBase}>Tax</label>
                    <select
                      value={String(input.taxable_sale)}
                      onChange={(e) => handleInputChange(index, 'taxable_sale', e.target.value === 'true')}
                      className={inputBase + ' cursor-pointer'}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 flex items-center gap-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(index);
                    }}
                  >
                    <CiTrash /> Delete
                  </button>
                </div>
              </div>
              {index !== formInputs.length - 1 && (
                <hr className="my-6 border-indigo-100 dark:border-slate-700" />
              )}
            </div>
          ))}
          <DialogDemo
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            purchases={SearchPurchaseState.data}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectPurchase={(purchaseId) => {
              handlePurchaseChange(dialogRowIndex, purchaseId);
              setDialogOpen(false);
            }}
            pagination={{
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: SearchPurchaseState.total
            }}
            setPagination={setPagination}
          />
          <div className="flex justify-end my-8">
            <button
              type="submit"
              disabled={createSaleState.isLoading}
              className={`${btnPrimary} min-w-[200px] justify-center py-3 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {createSaleState.isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Sale'
              )}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}
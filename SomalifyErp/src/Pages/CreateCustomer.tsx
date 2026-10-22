import React, { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { HiOutlineUserGroup, HiOutlineArrowRight } from "react-icons/hi2";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createCustomerFn, resetCustomer } from '@/Redux/Slice/CreateCustomerSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import SideParsm from '@/components/SideParsm';

export function CreateCustomer() {
  const toastId = "createCustomer";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const CreateCustomerState = useSelector((state:RootState) => state.CreateCustomer);

  const [formInputs, setFormInputs] = useState([
    {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      company_id: '',
    },
  ]);

  const handleAddNewInput = () => {
    setFormInputs([
      ...formInputs,
      {
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        company_id: '',
      },
    ]);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedInputs = [...formInputs];
    updatedInputs[index] = { ...updatedInputs[index], [field]: value };
    setFormInputs(updatedInputs);
  };

  const handleDelete = (index:number) => {
    const updatedInputs = [...formInputs];
    updatedInputs.splice(index, 1);
    setFormInputs(updatedInputs);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result as string;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
     const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const formattedData = data.slice(1).map((row: any[]) => {
        const [customer_name, customer_phone, vendor_email, customer_address] = row;
        return {
          customer_name: customer_name || '',
          customer_phone: customer_phone || '',
          vendor_email: vendor_email || '',
          customer_address: customer_address || '',
          company_id: '',
        };
      });

      setFormInputs(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const raw = localStorage.getItem('userInfo');
    const userInfo = raw ? JSON.parse(raw) : {};
    const companyId = userInfo.user?.company_id ?? userInfo.company_id ?? '';
    const formData = formInputs.map((input) => ({
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_address: input.customer_address,
      company_id: input.company_id || companyId,
    }));

    dispatch(createCustomerFn(formData));
  };

  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const basePath = isAdminDashboard ? '/AdminDashboard' : '/Dashboard';

  useEffect(() => {
    if (CreateCustomerState.isLoading) {
      toast.loading('Creating Customer...', { id: toastId });
    }
    if (CreateCustomerState.IsSuccess) {
      toast.success('Successfully created.', { id: toastId });
      navigate(`${basePath}/Sales`);
    }
    if (CreateCustomerState.isError) {
      toast.error(CreateCustomerState.errorMsg, { id: toastId });
    }
    dispatch(resetCustomer());
  }, [CreateCustomerState.IsSuccess, CreateCustomerState.isLoading, CreateCustomerState.isError, navigate, basePath, dispatch]);
  
   useEffect(()=>{
    if(!localStorage.getItem('userInfo')){
        navigate('/');
    }
  },[navigate])

  const inputBase = 'soft-field';
  const labelBase = 'soft-label';
  const btnPrimary = 'soft-submit';
  const btnSecondary = 'soft-btn-secondary';

  return (
    <div className="soft-page">
      <div className="p-3 flex items-center justify-between">
        <h1 className="lg:hidden">
          <SideParsm />
        </h1>
        <div className="navhome p-0 flex w-full justify-end" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card */}
        <div className="soft-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#605BFF] dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
                <HiOutlineUserGroup className="text-xl" />
              </div>
              <div>
                <h1 className="soft-title">Create Customer</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Add new customers to your sales records
                </p>
              </div>
            </div>
            <Link to={`${basePath}/Sales`} className={btnSecondary}>
              <HiOutlineArrowRight className="text-lg" />
              Back to Sales
            </Link>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="soft-card"
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-3 justify-end mb-6">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm transition-all flex items-center gap-2"
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
                className={btnSecondary}
                onClick={handleAddNewInput}
              >
                <GoPlus className="text-lg" />
                Add new
              </button>
            </div>

            {formInputs.map((input, index) => (
              <div
                key={index}
                className={`${index > 0 ? 'mt-8 pt-8 border-t border-indigo-100 dark:border-slate-700' : ''}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col">
                    <label htmlFor={`name-${index}`} className={labelBase}>
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`name-${index}`}
                      type="text"
                      className={inputBase}
                      placeholder="Customer name"
                      value={input.customer_name}
                      onChange={(e) => handleInputChange(index, 'customer_name', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor={`address-${index}`} className={labelBase}>
                      Address
                    </label>
                    <input
                      id={`address-${index}`}
                      type="text"
                      className={inputBase}
                      placeholder="Customer address"
                      value={input.customer_address}
                      onChange={(e) => handleInputChange(index, 'customer_address', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor={`phone-${index}`} className={labelBase}>
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`phone-${index}`}
                      type="tel"
                      className={inputBase}
                      placeholder="Phone number"
                      value={input.customer_phone}
                      onChange={(e) => handleInputChange(index, 'customer_phone', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col justify-end sm:flex-row lg:justify-end items-end">
                    <button
                      type="button"
                      className="px-4 py-2.5 flex items-center gap-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(index);
                      }}
                    >
                      <CiTrash className="text-lg" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={CreateCustomerState.isLoading}
                className={`${btnPrimary} min-w-[200px] justify-center`}
              >
                {CreateCustomerState.isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Customer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

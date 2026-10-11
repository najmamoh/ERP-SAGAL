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

  const inputBase =
    'w-full px-4 py-3 rounded-xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 transition-all duration-200';
  const labelBase = 'text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block';
  const btnPrimary =
    'px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#605BFF] to-[#3a3799] shadow-[0_4px_23px_0_rgba(96,91,255,0.5)] hover:shadow-[0_6px_28px_0_rgba(96,91,255,0.6)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2';
  const btnSecondary =
    'px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-700/80 shadow-sm transition-all flex items-center gap-2';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
      <div className="p-3 flex items-center justify-between">
        <h1 className="lg:hidden">
          <SideParsm />
        </h1>
        <div className="navhome p-0 flex w-full justify-end" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card */}
        <div className="mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-lg shadow-indigo-100/50 dark:shadow-slate-900/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/30">
                <HiOutlineUserGroup className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Customer</h1>
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
          className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-xl shadow-indigo-100/30 dark:shadow-slate-900/30 overflow-hidden"
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

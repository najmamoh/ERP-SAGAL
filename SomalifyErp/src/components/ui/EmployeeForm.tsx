import React, { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { createEmployeesFn, resetEmployesCr } from '@/Redux/Slice/Employe/CreateEmployesSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import { motion } from 'framer-motion';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';

interface EmployeeFormProps {
  onSuccess?: () => void;
}

export function EmployeeForm({ onSuccess }: EmployeeFormProps) {
  const toastId = 'createEmployees';
  const dispatch = useDispatch<AppDispatch>();
  const CreateEmployeState = useSelector((state: RootState) => state.CreateEmployee);
  const AllCompaniesState = useSelector((state: RootState) => state.AllCompanies);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userCompanyId = userInfo.user?.company_id || userInfo.company_id;

  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [formInputs, setFormInputs] = useState([
    {
      employee_name: '',
      employee_phone: '',
      employee_address: '',
      salary_amount: '',
      company_id: '',
    },
  ]);

  const companiesList = AllCompaniesState.data || [];

  useEffect(() => {
    dispatch(getAllCompaniesFn());
  }, [dispatch]);

  useEffect(() => {
    if (companiesList.length && !selectedCompanyId) {
      const defaultId = userCompanyId && companiesList.some((c: any) => c.company_id === userCompanyId)
        ? userCompanyId
        : companiesList[0].company_id;
      setSelectedCompanyId(defaultId);
    }
  }, [companiesList, userCompanyId, selectedCompanyId]);

  const handleAddNewInput = () => {
    setFormInputs([
      ...formInputs,
      {
        employee_name: '',
        employee_phone: '',
        employee_address: '',
        company_id: '',
        salary_amount: '',
      },
    ]);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedInputs = [...formInputs];
    updatedInputs[index] = { ...updatedInputs[index], [field]: value };
    setFormInputs(updatedInputs);
  };

  const handleDelete = (index: number) => {
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
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      }) as any[][];

      const formattedData = data.slice(1).map((row) => {
        const [employee_name, employee_phone, employee_address, salary_amount] = row;
        return {
          employee_name: employee_name || '',
          employee_phone: employee_phone?.toString() || '',
          employee_address: employee_address || '',
          salary_amount: salary_amount?.toString() || '',
          company_id: '',
        };
      });

      setFormInputs(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const companyId = selectedCompanyId || userCompanyId;
    if (!companyId) {
      toast.error('Please select a company');
      return;
    }
    const formData = formInputs.map((input) => ({
      employee_name: input.employee_name,
      employee_address: input.employee_address,
      employee_phone: input.employee_phone,
      salary_amount: input.salary_amount,
      company_id: companyId,
    }));

    dispatch(createEmployeesFn(formData));
  };

  useEffect(() => {
    if (CreateEmployeState.isLoading) {
      toast.loading('please wait...', { id: toastId });
    }
    if (CreateEmployeState.IsSuccess) {
      toast.success('Successfully created.', { id: toastId });
      onSuccess?.();
      dispatch(resetEmployesCr());
    }
    if (CreateEmployeState.isError) {
      toast.error(CreateEmployeState.errorMsg, { id: toastId });
      dispatch(resetEmployesCr());
    }
  }, [CreateEmployeState.IsSuccess, CreateEmployeState.isLoading, CreateEmployeState.isError, CreateEmployeState.errorMsg, dispatch, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col rounded-xl h-full">
      <div className="flex-1 overflow-y-auto px-6 pb-4 rounded-xl">
        {/* Company Selector */}
        <div className="mb-6 p-4 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
            <HiOutlineOfficeBuilding className="text-lg" />
            Company
          </label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full min-w-[280px] px-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none cursor-pointer"
            required
            disabled={AllCompaniesState.isLoading}
          >
            {AllCompaniesState.isLoading ? (
              <option value="">Loading companies...</option>
            ) : companiesList.length === 0 ? (
              <option value="">No companies found</option>
            ) : (
              <>
                <option value="">Select company</option>
                {companiesList.map((company: any) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        <div className="flex flex-wrap gap-3 justify-end mb-5">
          <button
            type="button"
            className="px-4 py-2.5 gap-2 flex items-center text-white rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all text-sm font-medium"
            onClick={() => document.getElementById('excel-import-employee')?.click()}
          >
            <CiImport className="text-lg" />
            Import Excel
          </button>
          <input
            id="excel-import-employee"
            type="file"
            accept=".csv, .xlsx"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="px-4 py-2.5 flex gap-2 items-center rounded bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all text-sm font-medium border border-gray-200/80 dark:border-gray-600/80"
            onClick={handleAddNewInput}
          >
            <GoPlus className="text-lg" />
            Add Row
          </button>
        </div>

        <div className="space-y-4">
          {formInputs.map((input, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-5 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-500/20 transition-all"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { key: 'employee_name', label: 'Full Name', placeholder: 'Employee name', type: 'text' },
                  { key: 'employee_phone', label: 'Phone', placeholder: '+1 234 567 8900', type: 'tel' },
                  { key: 'employee_address', label: 'Address', placeholder: 'Street, city', type: 'text' },
                  { key: 'salary_amount', label: 'Salary', placeholder: '0.00', type: 'number' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key} className="flex flex-col gap-2 min-w-0">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {label}
                    </label>
                    <input
                      type={type}
                      className="w-full min-w-[140px] rounded-lg border text-base border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/90 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all"
                      placeholder={placeholder}
                      value={input[key as keyof typeof input]}
                      onChange={(e) => handleInputChange(index, key, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
              {formInputs.length > 1 && (
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    className="px-3 py-1.5 flex items-center gap-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                    onClick={() => handleDelete(index)}
                  >
                    <CiTrash className="text-base" />
                    Remove
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-200/80 dark:border-gray-700/80 px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-8 py-3 text-sm rounded font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Employee
          </button>
        </div>
      </div>
    </form>
  );
}

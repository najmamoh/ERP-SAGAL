import { FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { AppDispatch, RootState } from '@/Redux/Store';
import { motion } from 'framer-motion';
import { createCompanyFn, resetCreateCompany } from '@/Redux/Slice/CreateCompanySlice';
import { UpdateCompanyFn, resetUpdateCompany } from '@/Redux/Slice/UpdateCompanySlice';

interface CompanyFormProps {
  mode: 'create' | 'update';
  companyId?: string;
  onSuccess?: () => void;
}

interface CompanyFormData {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  taxable: boolean;
  tax_percentage: number;
  isBanned: boolean;
}

export function CompanyForm({ mode, companyId, onSuccess }: CompanyFormProps) {
  const toastId = mode === 'create' ? 'createCompany' : 'updateCompany';
  const dispatch = useDispatch<AppDispatch>();
  
  const CreateCompanyState = useSelector((state: RootState) => state.CreateCompany);
  const UpdateCompanyState = useSelector((state: RootState) => state.UpdateCompany);
  const AllCompaniesState = useSelector((state: RootState) => state.AllCompanies);

  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    taxable: false,
    tax_percentage: 5,
    isBanned: false,
  });

  // Load company data for update mode
  useEffect(() => {
    if (mode === 'update' && companyId && AllCompaniesState.data) {
      const company = AllCompaniesState.data.find(c => c.company_id === companyId);
      if (company) {
        setFormData({
          company_name: company.company_name || '',
          company_address: company.company_address || '',
          company_phone: company.company_phone || '',
          company_email: company.company_email || '',
          taxable: company.taxable || false,
          tax_percentage: company.tax_percentage || 5,
          isBanned: company.isBanned || false,
        });
      }
    }
  }, [mode, companyId, AllCompaniesState.data]);

  // Handle create success
  useEffect(() => {
    if (mode === 'create') {
      if (CreateCompanyState.isLoading) {
        toast.loading('Creating Company...', { id: toastId });
      }
      if (CreateCompanyState.IsSuccess) {
        toast.success('Successfully created.', { id: toastId });
        onSuccess?.();
        dispatch(resetCreateCompany());
        // Reset form
        setFormData({
          company_name: '',
          company_address: '',
          company_phone: '',
          company_email: '',
          taxable: false,
          tax_percentage: 5,
          isBanned: false,
        });
      }
      if (CreateCompanyState.isError) {
        toast.error(CreateCompanyState.errorMsg, { id: toastId });
        dispatch(resetCreateCompany());
      }
    }
  }, [CreateCompanyState.isLoading, CreateCompanyState.IsSuccess, CreateCompanyState.isError, dispatch, mode, toastId, onSuccess]);

  // Handle update success
  useEffect(() => {
    if (mode === 'update') {
      if (UpdateCompanyState.isLoading) {
        toast.loading('Updating Company...', { id: toastId });
      }
      if (UpdateCompanyState.IsSuccess) {
        toast.success('Successfully updated.', { id: toastId });
        onSuccess?.();
        dispatch(resetUpdateCompany());
      }
      if (UpdateCompanyState.isError) {
        toast.error(UpdateCompanyState.errorMsg, { id: toastId });
        dispatch(resetUpdateCompany());
      }
    }
  }, [UpdateCompanyState.isLoading, UpdateCompanyState.IsSuccess, UpdateCompanyState.isError, dispatch, mode, toastId, onSuccess]);

  const handleInputChange = (field: keyof CompanyFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      const companyData = {
        company_name: formData.company_name,
        company_address: formData.company_address,
        company_phone: formData.company_phone,
        company_email: formData.company_email,
        taxable: formData.taxable,
        tax_percentage: formData.tax_percentage,
      };
      dispatch(createCompanyFn(companyData));
    } else if (mode === 'update' && companyId) {
      const companyData = {
        company_id: companyId,
        ...formData,
      };
      dispatch(UpdateCompanyFn(companyData));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-full">
      <div className="flex-1 overflow-y-auto p-6 pb-4">
        {/* Basic Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-5 mb-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Basic Information
          </h3>
          
          {/* Company Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              required
            />
          </div>

          {/* Company Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.company_email}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              required
            />
          </div>

          {/* Company Phone */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.company_phone}
              onChange={(e) => handleInputChange('company_phone', e.target.value)}
              required
            />
          </div>

          {/* Company Address */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Address <span className="text-red-500">*</span>
            </label>
            <textarea
              className="border border-gray-300 dark:border-gray-600 rounded-[5px] p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              value={formData.company_address}
              onChange={(e) => handleInputChange('company_address', e.target.value)}
              required
            />
          </div>
        </motion.div>

        {/* Taxable Information Section - Highlighted */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 space-y-5 mb-4 border-2 border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-indigo-200 dark:border-indigo-700">
            <span className="text-2xl">💰</span>
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">
              Tax Information
            </h3>
          </div>

          {/* Taxable */}
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-700">
            <input
              type="checkbox"
              id="taxable"
              className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              checked={formData.taxable}
              onChange={(e) => handleInputChange('taxable', e.target.checked)}
            />
            <label htmlFor="taxable" className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer">
              Enable Tax for this Company
            </label>
          </div>

          {/* Tax Percentage (shown when taxable) */}
          {formData.taxable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-700"
            >
              <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>📊</span>
                Tax Percentage (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="border-2 border-indigo-300 dark:border-indigo-600 rounded-[5px] p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-lg"
                value={formData.tax_percentage}
                onChange={(e) => handleInputChange('tax_percentage', Number(e.target.value))}
                placeholder="Enter tax percentage"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Default: 5%. Enter the tax percentage that will be applied to this company's transactions.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 dark:bg-gray-800/50 mb-[130px] rounded-xl p-6 space-y-5"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Status
          </h3>
          
          {/* Banned Status */}
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              id="isBanned"
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              checked={formData.isBanned}
              onChange={(e) => handleInputChange('isBanned', e.target.checked)}
            />
            <label htmlFor="isBanned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ban Company
            </label>
          </div>
        </motion.div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 sticky bottom-0">
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 text-white rounded-[5px] font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {mode === 'create' ? 'Create Company' : 'Update Company'}
          </button>
        </div>
      </div>
    </form>
  );
}

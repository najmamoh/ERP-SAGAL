import { FormEvent, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { createCustomerFn, resetCustomer } from '@/Redux/Slice/CreateCustomerSlice';
import { getAllCustomerFn } from '@/Redux/Slice/AllCustomers';
import toast from 'react-hot-toast';
import { GoPlus, GoX } from 'react-icons/go';
import { CiTrash } from 'react-icons/ci';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCustomerModal({ isOpen, onClose, onSuccess }: CreateCustomerModalProps) {
  const toastId = "createCustomerModal";
  const dispatch = useDispatch<AppDispatch>();
  const CreateCustomerState = useSelector((state: RootState) => state.CreateCustomer);

  const [formInputs, setFormInputs] = useState([
    {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
    },
  ]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormInputs([{ customer_name: '', customer_phone: '', customer_address: '' }]);
      dispatch(resetCustomer());
    }
  }, [isOpen, dispatch]);

  const handleAddNewInput = () => {
    setFormInputs([
      ...formInputs,
      {
        customer_name: '',
        customer_phone: '',
        customer_address: '',
      },
    ]);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedInputs = [...formInputs];
    updatedInputs[index] = { ...updatedInputs[index], [field]: value };
    setFormInputs(updatedInputs);
  };

  const handleDelete = (index: number) => {
    if (formInputs.length > 1) {
      const updatedInputs = [...formInputs];
      updatedInputs.splice(index, 1);
      setFormInputs(updatedInputs);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const hasErrors = formInputs.some((input, index) => {
      if (!input.customer_name.trim()) {
        toast.error(`Row ${index + 1}: Customer name is required`);
        return true;
      }
      return false;
    });

    if (hasErrors) return;

    const raw = localStorage.getItem('userInfo');
    const userInfo = raw ? JSON.parse(raw) : {};
    const companyId = userInfo.user?.company_id ?? userInfo.company_id ?? '';

    if (!companyId) {
      toast.error('Company ID not found. Please sign in again.');
      return;
    }

    const formData = formInputs.map((input) => ({
      customer_name: input.customer_name.trim(),
      customer_phone: input.customer_phone.trim(),
      customer_address: input.customer_address.trim(),
      company_id: companyId,
    }));

    dispatch(createCustomerFn(formData));
  };

  // Handle creation success
  useEffect(() => {
    if (CreateCustomerState.isLoading) {
      toast.loading('Creating customer...', { id: toastId });
    }
    if (CreateCustomerState.IsSuccess) {
      toast.success('Customer created successfully', { id: toastId });
      dispatch(resetCustomer());
      // Refresh customer list
      dispatch(getAllCustomerFn({ page: 1, pageSize: 20, search: '' }));
      onSuccess?.();
      onClose();
    }
    if (CreateCustomerState.isError) {
      toast.error(CreateCustomerState.errorMsg || 'Failed to create customer', { id: toastId });
      dispatch(resetCustomer());
    }
  }, [CreateCustomerState.IsSuccess, CreateCustomerState.isLoading, CreateCustomerState.isError, CreateCustomerState.errorMsg, dispatch, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Customer</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add a new customer for your company
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <GoX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {formInputs.map((input, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer {index + 1}
                  </span>
                  {formInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      aria-label="Delete customer"
                    >
                      <CiTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={input.customer_name}
                      onChange={(e) => handleInputChange(index, 'customer_name', e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={input.customer_phone}
                      onChange={(e) => handleInputChange(index, 'customer_phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={input.customer_address}
                      onChange={(e) => handleInputChange(index, 'customer_address', e.target.value)}
                      placeholder="Enter address"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Customer Button */}
          <button
            type="button"
            onClick={handleAddNewInput}
            className="mt-4 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <GoPlus className="w-4 h-4" />
            Add Another Customer
          </button>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={CreateCustomerState.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={CreateCustomerState.isLoading}
            >
              {CreateCustomerState.isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <GoPlus className="w-4 h-4" />
                  Create Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

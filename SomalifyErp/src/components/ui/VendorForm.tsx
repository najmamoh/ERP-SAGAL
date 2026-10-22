import React, { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { createVendorFn, resetVendor } from '@/Redux/Slice/CreateVendorSlice';
import { getOneVendorFn } from '@/Redux/Slice/GetOneVendor';
import { UpdateVendorFn, resetVendorUpdates } from '@/Redux/Slice/updateVEnderSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import { motion } from 'framer-motion';

interface VendorFormProps {
  mode: 'create' | 'update';
  vendorId?: number;
  onSuccess?: () => void;
}

export function VendorForm({ mode, vendorId, onSuccess }: VendorFormProps) {
  const toastId = mode === 'create' ? 'createVendor' : 'updateVendor';
  const dispatch = useDispatch<AppDispatch>();
  
  const CreateVendorState = useSelector((state: RootState) => state.CreateVendor);
  const UpdateVendorState = useSelector((state: RootState) => state.UpdateVendor);
  const OneVendorState = useSelector((state: RootState) => state.GetOneVendor);

  const [formInputs, setFormInputs] = useState([
    {
      vendor_name: '',
      vendor_address: '',
      vendor_email: '',
      vendor_phone: '',
    },
  ]);

  // Load vendor data for update mode
  useEffect(() => {
    if (mode === 'update' && vendorId) {
      dispatch(getOneVendorFn(vendorId));
    }
  }, [mode, vendorId, dispatch]);

  // Populate form with vendor data for update
  useEffect(() => {
    if (mode === 'update' && OneVendorState.data) {
      setFormInputs([{
        vendor_name: OneVendorState.data.vendor_name || '',
        vendor_address: OneVendorState.data.vendor_address || '',
        vendor_email: OneVendorState.data.vendor_email || '',
        vendor_phone: OneVendorState.data.vendor_phone || '',
      }]);
    }
  }, [mode, OneVendorState.data]);

  // Handle create success
  useEffect(() => {
    if (mode === 'create') {
      if (CreateVendorState.isLoading) {
        toast.loading('Creating Vendor...', { id: toastId });
      }
      if (CreateVendorState.IsSuccess) {
        toast.success('Successfully created.', { id: toastId });
        onSuccess?.();
        dispatch(resetVendor());
      }
      if (CreateVendorState.isError) {
        toast.error(CreateVendorState.errorMsg, { id: toastId });
        dispatch(resetVendor());
      }
    }
  }, [CreateVendorState.IsSuccess, CreateVendorState.isLoading, CreateVendorState.isError, dispatch, mode, toastId, onSuccess]);

  // Handle update success
  useEffect(() => {
    if (mode === 'update') {
      if (UpdateVendorState.isLoading) {
        toast.loading('Updating vendor...', { id: toastId });
      }
      if (UpdateVendorState.IsSuccess) {
        toast.success('Successfully updated.', { id: toastId });
        onSuccess?.();
        dispatch(resetVendorUpdates());
      }
      if (UpdateVendorState.isError) {
        toast.error(UpdateVendorState.errorMsg, { id: toastId });
        dispatch(resetVendorUpdates());
      }
    }
  }, [UpdateVendorState.isLoading, UpdateVendorState.IsSuccess, UpdateVendorState.isError, dispatch, mode, toastId, onSuccess]);

  const handleAddNewInput = () => {
    setFormInputs([
      ...formInputs,
      {
        vendor_name: '',
        vendor_address: '',
        vendor_email: '',
        vendor_phone: '',
      },
    ]);
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
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const formattedData = data.slice(1).map((row) => {
        const [vendor_name, vendor_address, vendor_email, vendor_phone] = row;
        return {
          vendor_name: vendor_name || '',
          vendor_address: vendor_address || '',
          vendor_email: vendor_email || '',
          vendor_phone: vendor_phone ? String(vendor_phone) : '',
        };
      });

      setFormInputs(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedInputs = [...formInputs];
    updatedInputs[index] = { ...updatedInputs[index], [field]: value };
    setFormInputs(updatedInputs);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      const formData = formInputs.map((input) => ({
        vendor_name: input.vendor_name,
        vendor_address: input.vendor_address,
        vendor_email: input.vendor_email,
        vendor_phone: String(input.vendor_phone),
      }));
      dispatch(createVendorFn(formData));
    } else if (mode === 'update' && vendorId) {
      const vendorData = {
        vendor_name: formInputs[0].vendor_name,
        vendor_address: formInputs[0].vendor_address,
        vendor_phone: formInputs[0].vendor_phone,
        vendor_email: formInputs[0].vendor_email,
        vendor_id: vendorId,
      };
      dispatch(UpdateVendorFn(vendorData));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col rounded-xl h-full">
      <div className="flex-1 overflow-y-auto px-6 pb-4 rounded-xl">
        {mode === 'create' && (
          <div className="flex flex-wrap gap-3 justify-end mb-5">
            <button
              type="button"
              className="soft-btn-secondary"
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
              className="px-4 py-2.5 flex gap-2 items-center rounded bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all text-sm font-medium border border-gray-200/80 dark:border-gray-600/80"
              onClick={handleAddNewInput}
            >
              <GoPlus className="text-lg" />
              Add Row
            </button>
          </div>
        )}

        <div className="space-y-4">
          {formInputs.map((input, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-5 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-500/20 transition-all"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'vendor_name', label: 'Full Name', placeholder: 'Vendor name', type: 'text' },
                  { key: 'vendor_address', label: 'Address', placeholder: 'Street, city', type: 'text' },
                  { key: 'vendor_email', label: 'Email', placeholder: 'email@example.com', type: 'email' },
                  { key: 'vendor_phone', label: 'Phone', placeholder: '+1 234 567 8900', type: 'text' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {label}
                    </label>
                    <input
                      type={type}
                      className="soft-field"
                      placeholder={placeholder}
                      value={input[key as keyof typeof input]}
                      onChange={(e) => handleInputChange(index, key, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
              {mode === 'create' && formInputs.length > 1 && (
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
            className="soft-submit"
          >
            {mode === 'create' ? 'Create Vendor' : 'Update Vendor'}
          </button>
        </div>
      </div>
    </form>
  );
}

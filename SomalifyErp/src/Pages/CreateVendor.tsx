

import React, { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createVendorFn, resetVendor } from '@/Redux/Slice/CreateVendorSlice';
import { AppDispatch, RootState } from '@/Redux/Store';

export function SheetCreateV() {
  const toastId = 'createVendor';

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const CreateVendorState = useSelector((state: RootState) => state.CreateVendor);

  const [formInputs, setFormInputs] = useState([
    {
      vendor_name: '',
      vendor_address: '',
      vendor_email: '',
      vendor_phone: '',
    },
  ]);

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

      // Ensure data is in the expected format
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
    const formData = formInputs.map((input) => ({
      vendor_name: input.vendor_name,
      vendor_address: input.vendor_address,
      vendor_email: input.vendor_email,
      vendor_phone: String(input.vendor_phone),
    }));

    dispatch(createVendorFn(formData));
  };

  useEffect(() => {
    if (CreateVendorState.isLoading) {
      toast.loading('Creating Vendor...', { id: toastId });
    }
    if (CreateVendorState.IsSuccess) {
      toast.success('Successfully created.', { id: toastId });
      navigate('/Dashboard/Vendor');
    }
    if (CreateVendorState.isError) {
      toast.error(CreateVendorState.errorMsg, { id: toastId });
    }
    dispatch(resetVendor());
  }, [CreateVendorState.IsSuccess, CreateVendorState.isLoading, CreateVendorState.isError, dispatch, navigate]);
  
  useEffect(() => {
    if (!localStorage.getItem('userInfo')) {
      navigate('/'); // or any other path you want to navigate to
    }
  }, [navigate]);
  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div>
        <h1 className="font-semibold text-lg">Create Vendor</h1>
        <form onSubmit={handleSubmit} className="bg-white text-black my-2 p-4 rounded-[8px] w-full flex flex-col">
          <div className="flex gap-2 justify-end px-4">
            <button
              type="button"
              className="bg-[#008CC8] px-2 gap-2 flex items-center text-white rounded-xl"
              onClick={() => document.getElementById('excel-import')?.click()}
            >
              <span className="text-xl"><CiImport /></span> Import Excel
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
              className="p-2 flex gap-2 items-center"
              onClick={handleAddNewInput}
            >
              <span className="bg-[#E1E0FF] text-xl p-2 rounded-full"><GoPlus /></span>Add New
            </button>
          </div>
          {formInputs.map((input, index) => (
            <div key={index}>
              <div className="formdiv flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-2">
                  <div className="flex flex-col">
                    <label htmlFor="">Full name</label>
                    <input
                      type="text"
                      className="border border-gray-400 rounded-[10px] p-2"
                      value={input.vendor_name}
                      onChange={(e) => handleInputChange(index, 'vendor_name', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Address</label>
                    <input
                      type="text"
                      className="border border-gray-400 rounded-[10px] p-2"
                      value={input.vendor_address}
                      onChange={(e) => handleInputChange(index, 'vendor_address', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Email</label>
                    <input
                      type="email"
                      className="border border-gray-400 rounded-[10px] p-2"
                      value={input.vendor_email}
                      onChange={(e) => handleInputChange(index, 'vendor_email', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Phone</label>
                    <input
                      type="text"
                      className="border border-gray-400 rounded-[10px] p-2"
                      value={input.vendor_phone}
                      onChange={(e) => handleInputChange(index, 'vendor_phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 flex items-center gap-2 rounded-lg text-red-500"
                    onClick={() => handleDelete(index)}
                  >
                    <CiTrash /> Delete
                  </button>
                </div>
              </div>
              {index !== formInputs.length - 1 && <hr />}
            </div>
          ))}
          <div className="div flex justify-end my-4">
            <button type='submit' className='bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] text-white p-2'>Create Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
}

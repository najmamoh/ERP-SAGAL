
import React, { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createBankFn, resetBank } from '@/Redux/Slice/CreateBankSlice';
import { AppDispatch, RootState } from '@/Redux/Store';

export function CreateBank() {
  const toastId = 'createBank';

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const CreateBankState = useSelector((state: RootState) => state.CreateBank);

  const [formInputs, setFormInputs] = useState([
    {
      bank_name: '',
      amount: '',
      sale_id: '',
    },
  ]);

  const handleAddNewInput = () => {
    setFormInputs([
      ...formInputs,
      {
        bank_name: '',
        amount: '',
        sale_id: '',
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
        const [bank_name, amount, sale_id] = row;
        return {
          bank_name: bank_name || '',
          amount: amount || '',
          sale_id: sale_id || '',
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
      bank_name: input.bank_name,
      amount: String(input.amount),
      sale_id: input.sale_id ? Number(input.sale_id) : null,
    }));

    dispatch(createBankFn(formData));
  };

  useEffect(() => {
    if (CreateBankState.isLoading) {
      toast.loading('Creating Bank...', { id: toastId });
    }
    if (CreateBankState.IsSuccess) {
      toast.success('Successfully created.', { id: toastId });
      navigate('/Dashboard/Banks');
    }
    if (CreateBankState.isError) {
      toast.error(CreateBankState.errorMsg, { id: toastId });
    }
    dispatch(resetBank());
  }, [CreateBankState.IsSuccess, CreateBankState.isLoading, CreateBankState.isError, dispatch, navigate]);
  
  useEffect(() => {
    if (!localStorage.getItem('userInfo')) {
      navigate('/');
    }
  }, [navigate]);
  
  return (
    <div className="soft-page">
      <div className="mb-4">
        <h1 className="soft-title">Create Bank</h1>
        <p className="soft-subtitle">Add one or more bank accounts.</p>
      </div>
        <form onSubmit={handleSubmit} className="soft-card">
          <div className="flex gap-2 justify-end px-4">
            <button
              type="button"
              className="soft-btn-secondary"
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
              className="soft-btn-ghost"
              onClick={handleAddNewInput}
            >
              <span className="bg-[#E1E0FF] text-xl p-2 rounded-full"><GoPlus /></span>Add New
            </button>
          </div>
          {formInputs.map((input, index) => (
            <div key={index}>
              <div className="formdiv flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  <div className="flex flex-col">
                    <label htmlFor="">Bank Name</label>
                    <input
                      type="text"
                      className="soft-field"
                      value={input.bank_name}
                      onChange={(e) => handleInputChange(index, 'bank_name', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Amount</label>
                    <input
                      type="number"
                      className="soft-field"
                      value={input.amount}
                      onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Sale ID (Optional)</label>
                    <input
                      type="number"
                      className="soft-field"
                      value={input.sale_id}
                      onChange={(e) => handleInputChange(index, 'sale_id', e.target.value)}
                      placeholder="Leave empty if not linked to sale"
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
          <div className="soft-actions">
            <button type='submit' className='soft-submit'>Create Bank</button>
          </div>
        </form>
    </div>
  );
}

import React, { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTransferFn, resetTransfer } from '@/Redux/Slice/CreateTransferSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllTreasuriesFn } from "@/Redux/Slice/TreasurySlice";

interface FormInput {
  payment_method: string;
  amount: string;
  currency_type: string;
  treasury_id: string;
}

export function CreateTransfer() {
  const toastId = 'createTransfer';
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const CreateTransferState = useSelector((state: RootState) => state.CreateTransfer);
  const treasuryState = useSelector((state: RootState) => state.treasury);

  const [formInputs, setFormInputs] = useState<FormInput[]>([
    { payment_method: '', amount: '', currency_type: '', treasury_id: '' },
  ]);

  /* ================= TREASURY LIST FROM REDUX ================= */
  useEffect(() => {
    dispatch(getAllTreasuriesFn());
  }, [dispatch]);

  /* ================= HANDLERS ================= */
  const handleAddNewInput = () => {
    setFormInputs([
      ...formInputs,
      { payment_method: '', amount: '', currency_type: '', treasury_id: '' },
    ]);
  };

  const handleDelete = (index: number) => {
    setFormInputs(formInputs.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedInputs = [...formInputs];
    updatedInputs[index] = { ...updatedInputs[index], [field]: value };
    setFormInputs(updatedInputs);
  };

  /* ================= EXCEL IMPORT ================= */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result as string;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const formattedData: FormInput[] = data.slice(1).map((row) => ({
        payment_method: row[0] || '',
        amount: row[1] || '',
        currency_type: row[2] || '',
        treasury_id: row[3] || '',
      }));

      setFormInputs(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const formData = formInputs
      .filter((input) => {
        const amount = Number(input.amount);
        return (
          input.payment_method &&
          input.amount &&
          input.currency_type &&
          input.treasury_id &&
          !isNaN(amount) &&
          amount > 0
        );
      })
      .map((input) => ({
        payment_method: input.payment_method,
        amount: String(Number(input.amount)),
        currency_type: input.currency_type,
        treasury_id: Number(input.treasury_id),
      }));

    if (formData.length === 0) {
      toast.error("Please fill valid inputs");
      return;
    }

    dispatch(createTransferFn(formData));
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (CreateTransferState.isLoading) {
      toast.loading('Creating Transfer...', { id: toastId });
    }
    if (CreateTransferState.IsSuccess) {
      toast.success('Successfully created.', { id: toastId });
      navigate('/Dashboard/Transfer_Money');
    }
    if (CreateTransferState.isError) {
      toast.error(CreateTransferState.errorMsg, { id: toastId });
    }
    dispatch(resetTransfer());
  }, [
    CreateTransferState.IsSuccess,
    CreateTransferState.isLoading,
    CreateTransferState.isError,
    dispatch,
    navigate
  ]);

  useEffect(() => {
    if (!localStorage.getItem('userInfo')) navigate('/');
  }, [navigate]);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="font-semibold text-lg mb-4">Create Transfer</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-2 justify-end mb-4">
          <button
            type="button"
            className="bg-[#008CC8] px-3 py-2 flex items-center gap-2 text-white rounded-xl"
            onClick={() => document.getElementById('excel-import')?.click()}
          >
            <CiImport /> Import Excel
          </button>
          <input id="excel-import" type="file" accept=".csv, .xlsx" hidden onChange={handleFileChange} />

          <button type="button" onClick={handleAddNewInput} className="flex items-center gap-2 px-3 py-2 border rounded-xl">
            <GoPlus /> Add New
          </button>
        </div>

        {formInputs.map((input, index) => (
          <div key={index} className="mt-4 border-b pb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label>Payment Method</label>
                <select
                  className="border rounded-lg p-2 w-full"
                  value={input.payment_method}
                  onChange={(e) => handleInputChange(index, 'payment_method', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="ZAAD">ZAAD</option>
                  <option value="EDAHAB">EDAHAB</option>
                </select>
              </div>

              <div>
                <label>Amount</label>
                <input
                  type="number"
                  className="border rounded-lg p-2 w-full"
                  value={input.amount}
                  onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                />
              </div>

              <div>
                <label>Currency</label>
                <select
                  className="border rounded-lg p-2 w-full"
                  value={input.currency_type}
                  onChange={(e) => handleInputChange(index, 'currency_type', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="USD">USD</option>
                  <option value="SOS">SOS</option>
                </select>
              </div>

              <div>
                <label>Treasury</label>
                {treasuryState.isLoading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <select
                    className="border rounded-lg p-2 w-full"
                    value={input.treasury_id}
                    onChange={(e) => handleInputChange(index, 'treasury_id', e.target.value)}
                  >
                    <option value="">Select Treasury</option>
                    {(treasuryState.treasuries || []).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="text-red-500 flex items-center gap-1"
              >
                <CiTrash /> Delete
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-4">
          <button type="submit" className="bg-[#605BFF] text-white px-6 py-2 rounded-lg">
            Create Transfer
          </button>
        </div>
      </form>
    </div>
  );
}

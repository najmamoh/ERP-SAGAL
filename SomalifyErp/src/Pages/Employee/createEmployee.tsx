import React, { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AppDispatch, RootState } from '@/Redux/Store';
import { createEmployeesFn, resetEmployesCr } from '@/Redux/Slice/Employe/CreateEmployesSlice';
import { Link } from 'react-router-dom';
import { IoIosArrowRoundBack } from 'react-icons/io';

export function CreateEmployees() {
  const toastId= "createEmployees";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const CreateEmployeState = useSelector((state:RootState) => state.CreateEmployee);

  const [formInputs, setFormInputs] = useState([
    {
        employee_name: '',
        employee_phone: '',
      employee_address: '',
      salary_amount: '',
      company_id: '',
    },
  ]);

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
    updatedInputs[index] =   { ...updatedInputs[index], [field]: value };;
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
      
      // Fix: Add proper type assertion for the sheet data
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: "" 
      }) as any[][];
  
      const formattedData = data.slice(1).map((row) => {
        const [employee_name, employee_phone ,employee_address, salary_amount, ] = row;
        return {
          employee_name: employee_name || '',
          employee_phone: employee_phone?.toString() || '', // Ensure string type for phone numbers
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
    const formData = formInputs.map((input) => ({
      employee_name: input.employee_name,
      employee_address: input.employee_address,
      employee_phone: input.employee_phone,
      salary_amount:input.salary_amount,
      company_id: '',
    }));

    dispatch(createEmployeesFn(formData));
  };

  useEffect(() => {
    if (CreateEmployeState.isLoading) {
      toast.loading('please wait...', { id: toastId });
    }
    if (CreateEmployeState.IsSuccess) {
      toast.success('Successfully created.', { id: toastId });
      navigate('/Dashboard/Employees');
      dispatch(resetEmployesCr());
    }
    if (CreateEmployeState.isError) {
      toast.error(CreateEmployeState.errorMsg, { id: toastId });
      dispatch(resetEmployesCr());
    }
  }, [CreateEmployeState.IsSuccess, CreateEmployeState.isLoading, CreateEmployeState.isError, CreateEmployeState.errorMsg, dispatch, navigate]);
  
   useEffect(()=>{
    if(!localStorage.getItem('userInfo')){
        navigate('/');
    }
  },[navigate])

  return (
    <div className="soft-page">
      <div>
        <form onSubmit={handleSubmit} className="soft-card">
        <Link to={'/Dashboard/Employees'}>
        <h1 className="text-3xl dark:text-black font-bold"><IoIosArrowRoundBack />
        </h1>
        </Link>
        <h1 className="soft-title">Create Employees.</h1>
          <div className="flex gap-2 justify-end px-4">
            <button type="button" className="soft-btn-secondary" onClick={() => document.getElementById('excel-import')!.click()}>
              <span className="text-xl"> <CiImport /> </span> Import Excel
            </button>
            <input
              id="excel-import"
              type="file"
              accept=".csv, .xlsx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button type="button" className="soft-btn-ghost" onClick={handleAddNewInput}>
              <span className="bg-[#E1E0FF] text-xl p-2 rounded-full"><GoPlus /></span>Add new
            </button>
          </div>
          {formInputs.map((input, index) => (
            <div key={index}>
              <div className="formdiv flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  <div className="flex flex-col">
                    <label htmlFor="">Full name</label>
                    <input
                      type="text"
                      className="soft-field"
                      value={input.employee_name}
                      onChange={(e) => handleInputChange(index, 'employee_name', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Phone Number</label>
                    <input
                      type="number"
                      className="soft-field"
                      value={input.employee_phone}
                      onChange={(e) => handleInputChange(index, 'employee_phone', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Adress</label>
                    <input
                      type="text"
                      className="soft-field"
                      value={input.employee_address}
                      onChange={(e) => handleInputChange(index, 'employee_address', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Salary</label>
                    <input
                      type="number"
                      className="soft-field"
                      value={input.salary_amount}
                      onChange={(e) => handleInputChange(index, 'salary_amount', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="px-4 py-2 flex items-center gap-2 rounded-lg text-red-500" onClick={(e) => {
                    e.preventDefault();
                    handleDelete(index);
                  }}>
                    <CiTrash /> Delete
                  </button>
                </div>
              </div>
              {index !== formInputs.length - 1 && <hr />}
            </div>
          ))}
          <div className="div flex justify-end my-4">
            <button type='submit' className='soft-submit'>create Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}

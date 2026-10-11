import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { createSalaryFn, resetSalary } from '@/Redux/Slice/Salareis/CreateSalarySlice';
import { UpdateSalaryFn, resetSalaryUpdates } from '@/Redux/Slice/Salareis/UpdateSalarySlice';
import { getOneSalaryFn } from '@/Redux/Slice/Salareis/getoneSlary';
import { getAllEmployersFn } from '@/Redux/Slice/Employe/AllEmloyers';
import toast from 'react-hot-toast';
import { BsCashCoin, BsCalendar3, BsPerson } from 'react-icons/bs';
import { HiOutlineCurrencyDollar } from 'react-icons/hi2';

interface SalaryFormProps {
  mode: 'create' | 'update';
  salaryId?: number;
  onSuccess: () => void;
  companyId?: string;
}

export function SalaryForm({ mode, salaryId, onSuccess, companyId }: SalaryFormProps) {
  const [paid_amount, setPaidAmount] = useState('');
  const [date, setDate] = useState('');
  const [employee_id, setEmployee] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const AllEmployees = useSelector((state: RootState) => state.AllEmployes);
  const OneSalaryState = useSelector((state: RootState) => state.getOnesalary);
  const CreateSalaryState = useSelector((state: RootState) => state.CreateSalary);
  const UpdateSalaryState = useSelector((state: RootState) => state.updateSalary);

  useEffect(() => {
    dispatch(getAllEmployersFn(companyId));
  }, [dispatch, companyId]);

  useEffect(() => {
    if (mode === 'update' && salaryId) {
      dispatch(getOneSalaryFn(salaryId));
    }
  }, [mode, salaryId, dispatch]);

  useEffect(() => {
    if (mode === 'update' && OneSalaryState.data && salaryId && OneSalaryState.data.salary_id === salaryId) {
      const d = OneSalaryState.data;
      setPaidAmount(d.paid_amount || '');
      setDate(d.date ? new Date(d.date).toISOString().slice(0, 10) : '');
      setEmployee(String(d.employee_id || ''));
    }
  }, [mode, OneSalaryState.data, salaryId]);

  // Set default date for create
  useEffect(() => {
    if (mode === 'create') {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [mode]);

  // Create success/error
  useEffect(() => {
    if (mode !== 'create') return;
    if (CreateSalaryState.IsSuccess) {
      toast.success('Salary payment created successfully!', { id: 'salary' });
      dispatch(resetSalary());
      onSuccess();
    }
    if (CreateSalaryState.isError) {
      toast.error(CreateSalaryState.errorMsg, { id: 'salary' });
      dispatch(resetSalary());
    }
  }, [CreateSalaryState.IsSuccess, CreateSalaryState.isError, dispatch, onSuccess, mode]);

  // Update success/error
  useEffect(() => {
    if (mode !== 'update') return;
    if (UpdateSalaryState.IsSuccess) {
      toast.success('Salary updated successfully!', { id: 'salary-update' });
      dispatch(resetSalaryUpdates());
      onSuccess();
    }
    if (UpdateSalaryState.isError) {
      toast.error(UpdateSalaryState.errorMsg, { id: 'salary-update' });
      dispatch(resetSalaryUpdates());
    }
  }, [UpdateSalaryState.IsSuccess, UpdateSalaryState.isError, dispatch, onSuccess, mode]);

  const isLoading = mode === 'create' ? CreateSalaryState.isLoading : UpdateSalaryState.isLoading;

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      dispatch(createSalaryFn({
        paid_amount,
        date,
        employee_id: +employee_id,
      }));
    } else if (mode === 'update' && salaryId) {
      dispatch(UpdateSalaryFn({
        salary_id: salaryId,
        paid_amount,
        date,
        employee_id: +employee_id,
      }));
    }
  };

  return (
    <form onSubmit={submitHandler} className="p-6 space-y-6">
      {/* Employee */}
      <div className="space-y-2">
        <label htmlFor="employee" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <BsPerson className="text-teal-600 dark:text-teal-400" />
          Employee <span className="text-red-500">*</span>
        </label>
        <select
          id="employee"
          value={employee_id}
          onChange={(e) => setEmployee(e.target.value)}
          required
          disabled={mode === 'update'}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        >
          <option value="">Select an employee</option>
          {AllEmployees?.data?.map((emp) => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.employee_name} {emp.salary_amount ? `($${parseFloat(emp.salary_amount).toLocaleString()})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Paid Amount */}
      <div className="space-y-2">
        <label htmlFor="paid_amount" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <HiOutlineCurrencyDollar className="text-teal-600 dark:text-teal-400" />
          Paid Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
          <input
            id="paid_amount"
            type="number"
            step="0.01"
            min="0"
            value={paid_amount}
            onChange={(e) => setPaidAmount(e.target.value)}
            required
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        {employee_id && AllEmployees?.data?.find((e) => e.employee_id === +employee_id)?.salary_amount && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Base salary: ${parseFloat(AllEmployees!.data!.find((e) => e.employee_id === +employee_id)!.salary_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <BsCalendar3 className="text-teal-600 dark:text-teal-400" />
          Payment Date <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <BsCashCoin className="text-lg" />
              {mode === 'create' ? 'Create Payment' : 'Update Payment'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

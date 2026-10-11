import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/Redux/Store'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast';
import { createSalaryFn, resetSalary } from '@/Redux/Slice/Salareis/CreateSalarySlice';
import { getAllEmployersFn } from '@/Redux/Slice/Employe/AllEmloyers';
import { Link } from 'react-router-dom';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { motion } from 'framer-motion';
import { BsCashCoin, BsCalendar3, BsPerson } from 'react-icons/bs';
import { HiOutlineCurrencyDollar } from 'react-icons/hi2';

function CreateSalary() {
  const [paid_amount, setPaidAmount] = useState('');
  const [date, setDate] = useState('');
  const [employee_id, setEmployee] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const AllEmployees = useSelector((state: RootState) => state.AllEmployes);
  useEffect(() => {
    dispatch(getAllEmployersFn());
  }, [dispatch]);

  const CreateSalaryState = useSelector(
    (state: RootState) => state.CreateSalary
  );
  const navigate = useNavigate();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      paid_amount,
      date,
      employee_id: +employee_id
    };
    dispatch(createSalaryFn(data));
  };

  useEffect(() => {
    if (CreateSalaryState.IsSuccess) {
      toast.success('Salary payment created successfully!', { id: 'salary' });
      navigate('/Dashboard/Employees/salaries');
    }

    if (CreateSalaryState.isError) {
      toast.error(CreateSalaryState.errorMsg, { id: 'salary' });
      dispatch(resetSalary());
    }
    dispatch(resetSalary());
  }, [CreateSalaryState.IsSuccess, CreateSalaryState.isError, CreateSalaryState.isLoading, dispatch, navigate]);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
      <div className='w-full px-4 md:px-6 lg:px-8 py-6 max-w-[900px] mx-auto'>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className='flex items-center gap-3 mb-6'>
            <motion.div
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={'/Dashboard/Employees/salaries'}>
                <button className='p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'>
                  <IoIosArrowRoundBack className="text-2xl" />
                </button>
              </Link>
            </motion.div>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-400 dark:via-emerald-400 dark:to-teal-400 flex items-center gap-3'>
                <BsCashCoin className="text-teal-600 dark:text-teal-400" />
                Create Salary Payment
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base'>
                Record a new salary payment for an employee
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
        >
          <form onSubmit={submitHandler} className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Employee Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-2"
              >
                <label htmlFor="employee" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <BsPerson className="text-teal-600 dark:text-teal-400" />
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  id="employee"
                  value={employee_id}
                  onChange={(e) => setEmployee(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <option value="">Select an employee</option>
                  {AllEmployees?.data?.map((employee) => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.employee_name} {employee.salary_amount ? `($${parseFloat(employee.salary_amount).toLocaleString()})` : ''}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Paid Amount */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-2"
              >
                <label htmlFor="paid_amount" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <HiOutlineCurrencyDollar className="text-teal-600 dark:text-teal-400" />
                  Paid Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">$</span>
                  <input
                    id="paid_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paid_amount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
                  />
                </div>
                {employee_id && AllEmployees?.data?.find(emp => emp.employee_id === +employee_id)?.salary_amount && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Employee's base salary: ${parseFloat(AllEmployees.data.find(emp => emp.employee_id === +employee_id)!.salary_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </motion.div>

              {/* Date */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-2"
              >
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
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
                />
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex justify-end gap-4"
            >
              <Link to={'/Dashboard/Employees/salaries'}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </motion.button>
              </Link>
              <motion.button
                type="submit"
                disabled={CreateSalaryState.isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/50 hover:shadow-teal-500/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {CreateSalaryState.isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <BsCashCoin className="text-lg" />
                    Create Payment
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateSalary;

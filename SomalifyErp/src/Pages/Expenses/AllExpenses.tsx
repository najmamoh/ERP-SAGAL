import { motion } from 'framer-motion';
import { HiOutlineCurrencyDollar } from 'react-icons/hi2';
import { useState } from "react";
import { useLocation } from "react-router-dom";
import ExpensesData from "@/components/ui/ExpensesData";
import { CompanyFilter } from "@/components/ui/CompanyFilter";

export function AllExpenses() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes("/AdminDashboard");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  return (
    <div className="w-full min-h-screen px-2 md:px-4 lg:px-6 py-4 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className='flex flex-col gap-4 mb-6'>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              className="relative p-2.5 rounded-[10px] bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
            >
              <HiOutlineCurrencyDollar className="text-white text-xl" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full"
              />
            </motion.div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400 flex items-center gap-2'>
                Expenses
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg"
                >
                  💸
                </motion.span>
              </h1>
              <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2'>
                <span>✨</span>
                View all expenses for branches
              </p>
            </div>
          </div>
          
          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-4"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <span>🔍</span>
              Filter Options
            </h3>
            <div className={`grid grid-cols-1 gap-4 ${isAdminDashboard ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
                  max={new Date().toISOString().slice(0, 10)}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              {isAdminDashboard && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Company
                  </label>
                  <CompanyFilter 
                    onCompanyChange={setSelectedCompanyId} 
                    selectedCompanyId={selectedCompanyId} 
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-[10px] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden w-full"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📋
            </motion.span>
            Expense List
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdminDashboard && selectedCompanyId ? 'Filtered by company' : isAdminDashboard ? 'All companies' : 'Company data'}
            {startDate && endDate && ` • ${startDate} to ${endDate}`}
          </p>
        </div>
        <div className="w-full overflow-x-auto">
          <ExpensesData 
            selectedCompanyId={isAdminDashboard ? selectedCompanyId : undefined} 
            startDate={startDate}
            endDate={endDate}
            onCompanyNotFound={() => setSelectedCompanyId('')}
          />
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { HiOutlineCurrencyDollar, HiOutlineBuildingOffice } from "react-icons/hi2";
import { useState } from "react";
import { CompanyFilter } from "@/components/ui/CompanyFilter";
import AdminExpensesData from "@/components/ui/AdminExpensesData";

export function AdminExpensesList() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30">
      <div className="px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200/80">
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                className="relative p-2.5 rounded-[10px] bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
              >
                <HiOutlineCurrencyDollar className="text-white text-xl" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  All Expenses
                </h1>
                <p className="text-xs text-gray-600 mt-1">
                  View expenses by company — select a company below to filter
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg border border-gray-100 p-4"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                    max={new Date().toISOString().slice(0, 10)}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">Select Company</label>
                  <CompanyFilter
                    onCompanyChange={setSelectedCompanyId}
                    selectedCompanyId={selectedCompanyId}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-[10px] shadow-xl border border-gray-100 overflow-hidden w-full"
        >
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              Expense List
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <HiOutlineBuildingOffice className="text-lg text-indigo-600" />
                Show expenses for:
              </span>
              <div className="min-w-[220px]">
                <CompanyFilter
                  onCompanyChange={setSelectedCompanyId}
                  selectedCompanyId={selectedCompanyId}
                  showLabel={false}
                />
              </div>
              {selectedCompanyId && (
                <button
                  type="button"
                  onClick={() => setSelectedCompanyId("")}
                  className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                >
                  Clear · Show all companies
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedCompanyId ? "Filtered by selected company" : "Showing all companies"}
              {startDate && endDate && ` • ${startDate} to ${endDate}`}
            </p>
          </div>
          <div className="w-full overflow-x-auto p-4">
            <AdminExpensesData
              selectedCompanyId={selectedCompanyId}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

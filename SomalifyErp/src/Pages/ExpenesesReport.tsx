// src/components/ExpensesReport.tsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store";
import {
  resetExpenses,
  SalaryExpense,
  OtherExpense,
  getAllExpensesReport,
} from "@/Redux/Slice/ExpensesSlice";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { format } from "date-fns";
import { getOneCompanayFN } from "@/Redux/Slice/GetOneCompanaySlice";
import { CompanyFilter } from "@/components/ui/CompanyFilter";
import { motion } from "framer-motion";
import { FiDollarSign, FiUsers, FiShoppingBag, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useLocation } from "react-router-dom";

const ExpensesReport: React.FC = () => {
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes('/AdminDashboard');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data: { salaryExpenses, otherExpenses }, isLoading } = useSelector(
    (state: RootState) => state.GetExpenses
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("reportCompanyId") || "" : ""
  );

  const GetOneCompanayState = useSelector((state: RootState) => state.GetOneCompanay);
  const companyId = isAdminDashboard
    ? (selectedCompanyId || sessionStorage.getItem('reportCompanyId'))
    : (GetOneCompanayState.data?.company_id ?? JSON.parse(localStorage.getItem('userInfo') || '{}')?.user?.company_id ?? JSON.parse(localStorage.getItem('userInfo') || '{}')?.company_id);

  // redirect if not logged in & reset on unmount
  useEffect(() => {
    if (!localStorage.getItem("userInfo")) navigate("/");
    return () => { dispatch(resetExpenses()); };
  }, [dispatch, navigate]);

  // submit date range — load ALL expenses between start and end date
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !companyId) return;
    dispatch(getAllExpensesReport({ 
      startDate, 
      endDate, 
      company_id: companyId ?? undefined
    }));
  };

  // columns
  const salaryCols: GridColDef[] = [
    { field: "employee_name", headerName: "Name", flex: 1 },
    { field: "employee_phone", headerName: "Phone", flex: 1 },
    { field: "salary_amount", headerName: "Salary", flex: 1 },
    { field: "paid_amount", headerName: "Paid", flex: 1 },
    { field: "employee_address", headerName: "Address", flex: 2 },
    { field: "date", headerName: "Date", flex: 1, valueFormatter: (value: any) => (value ? format(new Date(value), 'yyyy-MM-dd') : '') },  ];

  const otherCols: GridColDef[] = [
    { field: "item_name", headerName: "Item", flex: 1 },
    { field: "item_qty", headerName: "Qty", flex: 1, type: "number" },
    { field: "item_cost", headerName: "Cost", flex: 1 },
    { field: "paid_amount", headerName: "Paid", flex: 1 },
    { field: "date", headerName: "Date", flex: 1, valueFormatter: (value: any) => (value ? format(new Date(value), 'yyyy-MM-dd') : '') },  ];

  // rows + totals (all rows in date range)
  const salaryRows = salaryExpenses.data.map((e: SalaryExpense) => ({ id: e.salary_id, ...e }));
  const otherRows = otherExpenses.data.map((e: OtherExpense) => ({ id: e.expense_id, ...e }));

  const totalSalary =
    typeof salaryExpenses.totalAmount === "number"
      ? salaryExpenses.totalAmount
      : salaryExpenses.data.reduce((sum, e) => sum + parseFloat(String(e.paid_amount)), 0);
  const totalOther =
    typeof otherExpenses.totalAmount === "number"
      ? otherExpenses.totalAmount
      : otherExpenses.data.reduce((sum, e) => sum + parseFloat(String(e.item_cost)) * e.item_qty, 0);
  const totalPaid =
    typeof otherExpenses.totalPaid === "number"
      ? otherExpenses.totalPaid
      : otherExpenses.data.reduce((sum, e) => sum + parseFloat(String(e.paid_amount)), 0);
  const totalUnpaid =
    typeof otherExpenses.totalUnpaid === "number"
      ? otherExpenses.totalUnpaid
      : Math.max(totalOther - totalPaid, 0);

  useEffect(() => { dispatch(getOneCompanayFN()); }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="p-3 flex items-center justify-between">
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <Link to={isAdminDashboard ? "/AdminDashboard/Home" : "/Dashboard/Home"}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <IoArrowBack className="text-xl" />
            <span>Back to Reports</span>
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400">
                Expenses Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isAdminDashboard && selectedCompanyId ? 'Filtered by company' : 'Company data'}
              </p>
            </div>
            {isAdminDashboard && (
              <div className="w-full md:w-auto min-w-[200px]">
                <CompanyFilter 
                  onCompanyChange={(companyId) => {
                    setSelectedCompanyId(companyId);
                    if (startDate && endDate) {
                      dispatch(getAllExpensesReport({ 
                        startDate, 
                        endDate, 
                        company_id: companyId || undefined
                      }));
                    }
                  }} 
                  selectedCompanyId={selectedCompanyId} 
                />
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    max={new Date().toISOString().slice(0, 10)}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiDollarSign />
                {isLoading ? 'Loading...' : 'Get Expenses Report'}
              </motion.button>
            </form>
          </motion.div>

          {(salaryExpenses.data.length > 0 || otherExpenses.data.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiDollarSign className="text-2xl" />
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Total Expenses</span>
                </div>
                <h3 className="text-3xl font-bold">${(totalSalary + totalOther).toFixed(2)}</h3>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiUsers className="text-2xl" />
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Salary Expenses</span>
                </div>
                <h3 className="text-3xl font-bold">${totalSalary.toFixed(2)}</h3>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiShoppingBag className="text-2xl" />
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Other Expenses</span>
                </div>
                <h3 className="text-3xl font-bold">${totalOther.toFixed(2)}</h3>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiCheckCircle className="text-2xl" />
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Paid</span>
                </div>
                <h3 className="text-3xl font-bold">${totalPaid.toFixed(2)}</h3>
              </div>
              <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiAlertCircle className="text-2xl" />
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Not Paid</span>
                </div>
                <h3 className="text-3xl font-bold">${totalUnpaid.toFixed(2)}</h3>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Salary Expenses */}
        {salaryExpenses.data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6"
          >
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUsers />
                Salary Expenses
              </h2>
            </div>
            <Box className="w-full h-full border-none" sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box className="flex-1 w-full">
                <DataGrid
                  rows={salaryRows}
                  columns={salaryCols}
                  pagination
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 50 } },
                  }}
                  pageSizeOptions={[25, 50, 100, 200]}
                  loading={isLoading}
                  sx={{ 
                    border: "none",
                    minWidth: 900,
                    "& .MuiDataGrid-virtualScroller": {
                      overflowX: "auto"
                    }
                  }}
                />
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Other Expenses */}
        {otherExpenses.data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiShoppingBag />
                Other Expenses
              </h2>
            </div>
            <Box className="w-full h-full border-none" sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box className="flex-1 w-full">
                <DataGrid
                  rows={otherRows}
                  columns={otherCols}
                  pagination
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 50 } },
                  }}
                  pageSizeOptions={[25, 50, 100, 200]}
                  loading={isLoading}
                  sx={{ 
                    border: "none",
                    minWidth: 900,
                    "& .MuiDataGrid-virtualScroller": {
                      overflowX: "auto"
                    }
                  }}
                />
              </Box>
            </Box>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExpensesReport;

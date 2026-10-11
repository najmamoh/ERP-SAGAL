import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FiAlertCircle, FiCheckCircle, FiDollarSign, FiShoppingBag } from "react-icons/fi";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AppDispatch, RootState } from "@/Redux/Store";
import { getOneCompanayFN } from "@/Redux/Slice/GetOneCompanaySlice";
import {
  getUnpaidExpensesReportFn,
  resetUnpaidExpensesReport,
  UnpaidExpenseRow,
} from "@/Redux/Slice/UnpaidExpensesReportSlice";
import { CompanyFilter } from "@/components/ui/CompanyFilter";

function money(v: string | number | undefined | null): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  return parseFloat(String(v).replace(/[^0-9.-]/g, "")) || 0;
}

const UnpaidExpensesReport: React.FC = () => {
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes("/AdminDashboard");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data, isLoading, isError, errorMsg } = useSelector(
    (state: RootState) => state.UnpaidExpensesReport
  );
  const GetOneCompanayState = useSelector((state: RootState) => state.GetOneCompanay);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("reportCompanyId") || "" : ""
  );

  const companyId = isAdminDashboard
    ? selectedCompanyId || sessionStorage.getItem("reportCompanyId")
    : GetOneCompanayState.data?.company_id ??
      JSON.parse(localStorage.getItem("userInfo") || "{}")?.user?.company_id ??
      JSON.parse(localStorage.getItem("userInfo") || "{}")?.company_id;

  useEffect(() => {
    if (!localStorage.getItem("userInfo")) navigate("/");
    dispatch(getOneCompanayFN());
    return () => {
      dispatch(resetUnpaidExpensesReport());
    };
  }, [dispatch, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !companyId) return;
    dispatch(
      getUnpaidExpensesReportFn({
        startDate,
        endDate,
        company_id: companyId ?? undefined,
      })
    );
  };

  const columns: GridColDef[] = [
    { field: "item_name", headerName: "Item", flex: 1.2 },
    { field: "item_qty", headerName: "Qty", flex: 0.5, type: "number" },
    {
      field: "item_cost",
      headerName: "Cost",
      flex: 0.7,
      valueFormatter: (value: unknown) => money(value as string | number).toFixed(2),
    },
    {
      field: "line_total",
      headerName: "Total",
      flex: 0.8,
      valueFormatter: (value: unknown) => money(value as string | number).toFixed(2),
    },
    {
      field: "paid_amount",
      headerName: "Paid",
      flex: 0.8,
      valueFormatter: (value: unknown) => money(value as string | number).toFixed(2),
    },
    {
      field: "unpaid_amount",
      headerName: "Not Paid",
      flex: 0.8,
      valueFormatter: (value: unknown) => money(value as string | number).toFixed(2),
    },
    {
      field: "payment_status",
      headerName: "Status",
      flex: 0.8,
      valueFormatter: (value: unknown) =>
        String(value) === "unpaid" ? "Unpaid" : "Partial",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0.9,
      valueFormatter: (value: unknown) =>
        value ? format(new Date(String(value)), "yyyy-MM-dd") : "",
    },
  ];

  const rows = (data.data || []).map((e: UnpaidExpenseRow) => ({
    id: e.expense_id,
    ...e,
  }));

  const hasData = (data.data || []).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
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

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Unpaid / Partial Expenses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Expenses not fully paid between start and end date
            </p>
          </div>
          {isAdminDashboard && (
            <div className="w-full md:w-auto min-w-[200px]">
              <CompanyFilter
                onCompanyChange={(id) => {
                  setSelectedCompanyId(id);
                  if (startDate && endDate && id) {
                    dispatch(
                      getUnpaidExpensesReportFn({
                        startDate,
                        endDate,
                        company_id: id,
                      })
                    );
                  }
                }}
                selectedCompanyId={selectedCompanyId}
              />
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-4 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                max={new Date().toISOString().slice(0, 10)}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            <FiAlertCircle />
            {isLoading ? "Loading..." : "Get Unpaid Expenses"}
          </button>
          {isError && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
          )}
        </form>

        {hasData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiShoppingBag className="text-xl" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Rows</span>
                </div>
                <h3 className="text-2xl font-bold">{data.total}</h3>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiDollarSign className="text-xl" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Line Total</span>
                </div>
                <h3 className="text-2xl font-bold">${money(data.totalLineAmount).toFixed(2)}</h3>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiCheckCircle className="text-xl" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Paid</span>
                </div>
                <h3 className="text-2xl font-bold">${money(data.totalPaid).toFixed(2)}</h3>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FiAlertCircle className="text-xl" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Not Paid</span>
                </div>
                <h3 className="text-2xl font-bold">${money(data.totalUnpaid).toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiAlertCircle />
                  Unpaid & Partial Expenses
                </h2>
              </div>
              <Box sx={{ width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pagination
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 50 } },
                  }}
                  pageSizeOptions={[25, 50, 100, 200]}
                  loading={isLoading}
                  autoHeight
                  sx={{
                    border: "none",
                    minWidth: 900,
                    "& .MuiDataGrid-virtualScroller": { overflowX: "auto" },
                  }}
                />
              </Box>
            </div>
          </>
        )}

        {!isLoading && !hasData && startDate && endDate && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            No unpaid or partial expenses in this date range.
          </p>
        )}
      </div>
    </div>
  );
};

export default UnpaidExpensesReport;

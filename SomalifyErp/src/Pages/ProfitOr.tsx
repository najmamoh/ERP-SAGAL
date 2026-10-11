import React, { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/Redux/Store";
import { useSelector, useDispatch } from "react-redux";
import { IoArrowBack } from "react-icons/io5";
import { FiPrinter } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { getOneCompanayFN } from "@/Redux/Slice/GetOneCompanaySlice";
import { AllIncomeReportFn } from "@/Redux/Slice/ReportIncomeSlice";
import { CompanyFilter } from "@/components/ui/CompanyFilter";

function ProfitOr() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes("/AdminDashboard");
  const dispatch = useDispatch<AppDispatch>();
  const GetAllincomeState = useSelector(
    (state: RootState) => state.getAllIncomeReport
  );
  const GetOneCompanayState = useSelector(
    (state: RootState) => state.GetOneCompanay
  );

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("reportCompanyId") || "" : ""
  );

  const companyId = isAdminDashboard
    ? (selectedCompanyId || sessionStorage.getItem("reportCompanyId"))
    : (GetOneCompanayState.data?.company_id ?? JSON.parse(localStorage.getItem("userInfo") || "{}")?.user?.company_id ?? JSON.parse(localStorage.getItem("userInfo") || "{}")?.company_id);

  useEffect(() => {
    dispatch(getOneCompanayFN());
  }, [dispatch]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate && companyId) {
      dispatch(AllIncomeReportFn({ startDate, endDate, company_id: companyId }));
    }
  };

  return (
    <>

      <div className="min-h-screen overflow-auto bg-slate-50/80 dark:bg-slate-900/30">
        {/* Top */}
        <div className="p-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50">
        </div>

        {/* Back */}
        <div className="px-4 md:px-6 pt-4 flex flex-wrap items-center justify-between gap-4">
          <Link
            to={isAdminDashboard ? "/AdminDashboard/Home" : "/Dashboard/Reports"}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200 text-sm font-medium"
          >
            <IoArrowBack className="text-lg" />
            <span>Back to Reports</span>
          </Link>
          {isAdminDashboard && (
            <CompanyFilter
              onCompanyChange={setSelectedCompanyId}
              selectedCompanyId={selectedCompanyId}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center px-4 md:px-6 pb-10">
          {/* Header + Print */}
          <div className="w-full max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                {GetOneCompanayState.data.company_name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Income Report</p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-all duration-200 text-sm font-medium border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
            >
              <FiPrinter className="text-lg" />
              <span>Print</span>
            </button>
          </div>

          {/* Date Filters */}
          <form
            onSubmit={submitHandler}
            className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 shadow-sm"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Start date</label>
              <input
                type="date"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]/50 transition-colors"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">End date</label>
              <input
                type="date"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]/50 transition-colors"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="sm:col-span-2 flex justify-center pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-medium text-sm shadow-md shadow-blue-700/20 transition-all duration-200"
              >
                Get Income Report
              </button>
            </div>
          </form>

          {/* Report Card */}
          <div className="bg-white dark:bg-slate-900/50 w-full max-w-4xl rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden">
            <div className="p-6 sm:p-10 space-y-8">
              {/* Sales */}
              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sales</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                  Total sales = invoiced line amounts. Cash received and balance due split what was actually collected vs still owed.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Total Sales</span>
                    <span className="text-slate-800 dark:text-slate-100 font-semibold tabular-nums">${GetAllincomeState.data.totalSales || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-300 font-medium" title="Money collected on sales in this period">
                      Cash received (sales)
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">${GetAllincomeState.data.cashReceivedFromSales ?? '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-300 font-medium" title="Unpaid portion of sales (still due from customers)">
                      Balance due (owed)
                    </span>
                    <span className="text-amber-700 dark:text-amber-400 font-semibold tabular-nums">${GetAllincomeState.data.balanceDueOnSales ?? '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Cost of Goods Sold</span>
                    <span className="text-slate-800 dark:text-slate-100 font-semibold tabular-nums">${GetAllincomeState.data.costOfGoodsSold || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">Net Sale (gross profit)</span>
                    <span className="text-[#1d4ed8] dark:text-blue-400 font-bold tabular-nums">${GetAllincomeState.data.netSale || 0}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Cash received − Cost of Goods Sold</p>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Expenses</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                  Total expenses = full cost in the date range. Paid expenses = money actually paid; unpaid stays out of profit/loss.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Salary Expenses</span>
                    <span className="text-slate-800 dark:text-slate-100 font-semibold tabular-nums">${GetAllincomeState.data.salaryExpenses || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Other Expenses (total)</span>
                    <span className="text-slate-800 dark:text-slate-100 font-semibold tabular-nums">${GetAllincomeState.data.otherExpenses || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Other Expenses (paid)</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">${GetAllincomeState.data.otherExpensesPaid ?? '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Other Expenses (not paid)</span>
                    <span className="text-amber-700 dark:text-amber-400 font-semibold tabular-nums">${GetAllincomeState.data.otherExpensesUnpaid ?? '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">Total Expenses</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold tabular-nums">${GetAllincomeState.data.totalExpenses || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">Paid Expenses (used for profit/loss)</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">${GetAllincomeState.data.paidExpenses ?? '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Net profit */}
              <div className="space-y-3 pt-4 border-t-2 border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 -mx-6 sm:-mx-10 px-6 sm:px-10 py-5 rounded-xl">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100 block">Net profit (accrual)</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Sales value − COGS − paid expenses</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">${GetAllincomeState.data.income || 0}</span>
                </div>
                <div className="flex justify-between items-center gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-600/80">
                  <div>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100 block">Net profit (cash)</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Cash received − COGS − paid expenses</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">${GetAllincomeState.data.incomeCash ?? GetAllincomeState.data.income ?? '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfitOr;

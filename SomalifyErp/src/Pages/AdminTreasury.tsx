"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import TreasuryTable from "@/Pages/TreasuryTable";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { AppDispatch, RootState } from "@/Redux/Store";
import { getAllCompanyBalancesFn } from "@/Redux/Slice/TreasurySlice";
import { CompanyFilter } from "@/components/ui/CompanyFilter";
import type { TransferFilterType } from "@/Pages/TreasuryTable";

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function AdminTreasury() {
  const dispatch = useDispatch<AppDispatch>();
  const { companyBalancesTotal, companyBalancesLoading } = useSelector(
    (state: RootState) => state.treasury
  );
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [transferFilter, setTransferFilter] = useState<TransferFilterType>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [tableKey, setTableKey] = useState(0);

  const refreshData = useCallback(() => {
    dispatch(
      getAllCompanyBalancesFn(selectedCompanyId ? { company_id: selectedCompanyId } : undefined)
    );
    setTableKey((k) => k + 1);
  }, [dispatch, selectedCompanyId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const onFocus = () => refreshData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshData]);

  const handleFilterClose = (value?: TransferFilterType) => {
    setFilterAnchor(null);
    if (value !== undefined) setTransferFilter(value);
  };

  const filterLabel =
    transferFilter === "all" ? "All" : transferFilter === "sent" ? "Sent" : "Received";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="rounded-2xl bg-blue-50 border border-indigo-500/20 px-6 py-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center border border-indigo-200/60">
                <HiOutlineBanknotes className="text-2xl text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  Treasury
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Balances and transfers for all companies.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-blue-100 border border-indigo-500/20 px-5 py-3 shadow-sm">
                <span className="text-sm font-medium text-slate-600">
                  {selectedCompanyId ? "Company balance" : "Total (all companies)"}
                </span>
                <span className="text-xl font-bold tabular-nums text-slate-800">
                  {companyBalancesLoading ? "..." : `$${formatUsd(companyBalancesTotal)}`}
                </span>
              </div>
              <CompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
              />
              <button
                type="button"
                onClick={refreshData}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
                title="Refresh"
              >
                <FiRefreshCw className="text-slate-500 text-sm" /> Refresh
              </button>
              <button
                type="button"
                onClick={(e) => setFilterAnchor(e.currentTarget)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
              >
                <FiFilter className="text-slate-500 text-sm" /> {filterLabel}
              </button>
              <Menu
                anchorEl={filterAnchor}
                open={Boolean(filterAnchor)}
                onClose={() => handleFilterClose()}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: { borderRadius: 10, minWidth: 100, mt: 1 },
                }}
                MenuListProps={{ sx: { py: 0 } }}
              >
                <MenuItem onClick={() => handleFilterClose("all")} sx={{ py: 0.75, px: 2, fontSize: "0.8125rem" }}>All</MenuItem>
                <MenuItem onClick={() => handleFilterClose("sent")} sx={{ py: 0.75, px: 2, fontSize: "0.8125rem" }}>Sent</MenuItem>
                <MenuItem onClick={() => handleFilterClose("received")} sx={{ py: 0.75, px: 2, fontSize: "0.8125rem" }}>Received</MenuItem>
              </Menu>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              {selectedCompanyId ? "Company transfers" : "All companies — transfers"}
            </h2>
          </div>
          <div className="p-5 sm:p-6">
            <TreasuryTable
              key={tableKey}
              transferFilter={transferFilter}
              selectedCompanyId={selectedCompanyId || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTreasury;

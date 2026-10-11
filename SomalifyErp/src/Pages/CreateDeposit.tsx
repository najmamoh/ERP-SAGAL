"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AppDispatch, RootState } from "@/Redux/Store";
import {
  createDepositFn,
  getTreasuryBalanceFn,
  resetTreasuryState,
} from "@/Redux/Slice/TreasurySlice";
import SideParsm from "@/components/SideParsm";
import { HiOutlineArrowDownTray, HiOutlineArrowRight, HiOutlineBanknotes } from "react-icons/hi2";

interface FormState {
  amount: string;
  description: string;
}

export default function CreateDeposit() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const toastId = "createDeposit";

  const isAdminDashboard = location.pathname.startsWith("/AdminDashboard");
  const basePath = isAdminDashboard ? "/AdminDashboard" : "/Dashboard";

  const { isLoading, isError, isSuccess, errorMsg, balance, balanceLoading } = useSelector(
    (state: RootState) => state.treasury
  );

  const [form, setForm] = useState<FormState>({
    amount: "",
    description: "",
  });

  /* ================= HANDLE INPUT ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= FETCH BALANCE ================= */
  useEffect(() => {
    dispatch(getTreasuryBalanceFn());
  }, [dispatch]);

  /* ================= SUBMIT ================= */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const amount = Number(form.amount);

    if (!form.amount.trim() || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    dispatch(
      createDepositFn({
        amount,
        description: form.description.trim() || undefined,
      })
    );
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (isLoading) toast.loading("Creating deposit...", { id: toastId });

    if (isSuccess) {
      toast.success("Deposit created successfully", { id: toastId });
      navigate(`${basePath}/Treasury`);
    }

    if (isError) {
      const msg = typeof errorMsg === "string" ? errorMsg : (errorMsg as any)?.message ?? "An error occurred";
      toast.error(msg, { id: toastId });
    }

    dispatch(resetTreasuryState());
  }, [isLoading, isSuccess, isError, navigate, basePath, errorMsg, dispatch]);

  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 transition-all duration-200";
  const labelBase = "text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block";
  const btnPrimary =
    "px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#605BFF] to-[#3a3799] shadow-[0_4px_23px_0_rgba(96,91,255,0.5)] hover:shadow-[0_6px_28px_0_rgba(96,91,255,0.6)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2";
  const btnSecondary =
    "px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-700/80 shadow-sm transition-all flex items-center gap-2";

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
      <div className="p-3 flex items-center justify-between">
        <h1 className="lg:hidden">
          <SideParsm />
        </h1>
        <div className="navhome p-0 flex w-full justify-end" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card */}
        <div className="mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-lg shadow-indigo-100/50 dark:shadow-slate-900/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/30">
                <HiOutlineArrowDownTray className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Make Deposit</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Add funds to your treasury account
                </p>
              </div>
            </div>
            <Link to={`${basePath}/Treasury`} className={btnSecondary}>
              <HiOutlineArrowRight className="text-lg" />
              Back to Treasury
            </Link>
          </div>
        </div>

        {/* Balance Display */}
        {balance !== null && (
          <div className="mb-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-lg shadow-indigo-100/50 dark:shadow-slate-900/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HiOutlineBanknotes className="text-2xl text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Balance</span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-slate-800 dark:text-white">
                {balanceLoading ? "..." : balance != null ? Number(balance).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        )}

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-xl shadow-indigo-100/30 dark:shadow-slate-900/30 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6">
              {/* Amount */}
              <div className="flex flex-col">
                <label htmlFor="amount" className={labelBase}>
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  required
                  className={inputBase}
                  placeholder="Enter amount"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label htmlFor="description" className={labelBase}>
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputBase} resize-none`}
                  placeholder="Add a note about this deposit..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className={`${btnPrimary} min-w-[200px] justify-center`}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <HiOutlineArrowDownTray className="text-lg" />
                    Deposit
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

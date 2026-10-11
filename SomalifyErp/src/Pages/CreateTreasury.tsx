"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AppDispatch, RootState } from "@/Redux/Store";
import {
  createTreasuryFn,
  getTreasuryBalanceFn,
  getBanksForTransferFn,
  resetTreasuryState,
} from "@/Redux/Slice/TreasurySlice";
import SideParsm from "@/components/SideParsm";
import {
  HiOutlineArrowRight,
  HiOutlineBanknotes,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";

interface FormState {
  receiver_id: string;
  amount: string;
}

export default function CreateTreasury() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const toastId = "createTreasury";

  const isAdminDashboard = location.pathname.startsWith("/AdminDashboard");
  const basePath = isAdminDashboard ? "/AdminDashboard" : "/Dashboard";

  const { isLoading, isError, isSuccess, errorMsg, balance, balanceLoading, banksList, banksLoading } = useSelector(
    (state: RootState) => state.treasury
  );

  const [form, setForm] = useState<FormState>({
    receiver_id: "",
    amount: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    dispatch(getTreasuryBalanceFn());
    dispatch(getBanksForTransferFn());
  }, [dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const receiverId = form.receiver_id.trim();
    const amount = Number(form.amount);

    if (!receiverId) {
      toast.error("Please select a bank");
      return;
    }
    if (!form.amount.trim() || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    dispatch(
      createTreasuryFn({
        receiver_id: receiverId,
        receiver_type: "BANK",
        amount,
        currency_type: "USD",
      })
    );
  };

  useEffect(() => {
    if (isLoading) toast.loading("Creating transfer...", { id: toastId });

    if (isSuccess) {
      toast.success("Transfer created successfully", { id: toastId });
      navigate(`${basePath}/Treasury`);
    }

    if (isError) {
      const msg =
        typeof errorMsg === "string" ? errorMsg : (errorMsg as any)?.message ?? "An error occurred";
      toast.error(msg, { id: toastId });
    }

    dispatch(resetTreasuryState());
  }, [isLoading, isSuccess, isError, navigate, basePath, errorMsg, dispatch]);

  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 transition-all duration-200";
  const labelBase =
    "text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block";
  const btnPrimary =
    "px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#605BFF] to-[#3a3799] shadow-[0_4px_23px_0_rgba(96,91,255,0.5)] hover:shadow-[0_6px_28px_0_rgba(96,91,255,0.6)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2";
  const btnSecondary =
    "px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-700/80 shadow-sm transition-all flex items-center gap-2";

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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/30">
                <HiOutlineCurrencyDollar className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Transfer Money
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Send funds to bank (USD only) — pending admin approval
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
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Current Balance
                </span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-slate-800 dark:text-white">
                {balanceLoading
                  ? "..."
                  : balance != null
                  ? Number(balance).toFixed(2)
                  : "0.00"}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Bank selection */}
              <div className="flex flex-col">
                <label htmlFor="receiver_id" className={labelBase}>
                  Destination Bank <span className="text-red-500">*</span>
                </label>
                <select
                  id="receiver_id"
                  name="receiver_id"
                  value={form.receiver_id}
                  onChange={handleChange}
                  required
                  disabled={banksLoading}
                  className={inputBase}
                >
                  <option value="">
                    {banksLoading ? "Loading banks..." : "Select bank"}
                  </option>
                  {banksList.map((b: any) => (
                    <option key={b.account_id} value={b.account_id}>
                      {b.account_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col">
                <label htmlFor="amount" className={labelBase}>
                  Amount (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold select-none">$</span>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    required
                    className={`${inputBase} pl-8`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Info note */}
            <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
              <HiOutlineCurrencyDollar className="text-indigo-500 text-base shrink-0" />
              All transfers are in <span className="font-semibold text-indigo-600">USD</span> and must be approved by the main admin before funds are credited.
            </p>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`${btnPrimary} min-w-[200px] justify-center`}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <HiOutlineBanknotes className="text-lg" />
                    Transfer to Bank
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

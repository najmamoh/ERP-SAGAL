"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { AppDispatch, RootState } from "@/Redux/Store";
import {
  requestWithdrawalFn,
  getBanksForTransferFn,
  resetTreasuryState,
  getTreasuryBalanceFn,
} from "@/Redux/Slice/TreasurySlice";
import SideParsm from "@/components/SideParsm";
import {
  HiOutlineArrowRight,
  HiOutlineBanknotes,
  HiOutlineCurrencyDollar,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";

export default function RequestWithdrawal() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const toastId = "requestWithdrawal";

  const { isLoading, isError, isSuccess, errorMsg, balance, balanceLoading, banksList, banksLoading } =
    useSelector((state: RootState) => state.treasury);

  const [form, setForm] = useState({ bank_id: "", amount: "" });

  useEffect(() => {
    dispatch(getTreasuryBalanceFn());
    dispatch(getBanksForTransferFn());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.bank_id) {
      toast.error("Please select a bank");
      return;
    }
    const amount = Number(form.amount);
    if (!form.amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    dispatch(requestWithdrawalFn({ bank_id: form.bank_id, amount }));
  };

  useEffect(() => {
    if (isLoading) toast.loading("Submitting request...", { id: toastId });

    if (isSuccess) {
      toast.success("Withdrawal request submitted — pending admin approval", { id: toastId });
      navigate("/Dashboard/Treasury");
    }

    if (isError) {
      const msg = typeof errorMsg === "string" ? errorMsg : (errorMsg as any)?.message ?? "An error occurred";
      toast.error(msg, { id: toastId });
    }

    dispatch(resetTreasuryState());
  }, [isLoading, isSuccess, isError, navigate, errorMsg, dispatch]);

  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-amber-50/50 border border-amber-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300 transition-all duration-200";
  const labelBase = "text-sm font-medium text-slate-600 mb-1.5 block";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-yellow-50/40">
      <div className="p-3 flex items-center justify-between">
        <h1 className="lg:hidden">
          <SideParsm />
        </h1>
        <div className="navhome p-0 flex w-full justify-end" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card */}
        <div className="mb-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-amber-100/80 shadow-lg shadow-amber-100/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/60">
                <HiOutlineArrowDownTray className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Request Withdrawal</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Request USD withdrawal from bank — pending main admin approval
                </p>
              </div>
            </div>
            <Link
              to="/Dashboard/Treasury"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-sm transition-all flex items-center gap-2"
            >
              <HiOutlineArrowRight className="text-lg" />
              Back to Treasury
            </Link>
          </div>
        </div>

        {/* Balance Display */}
        {balance !== null && (
          <div className="mb-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-amber-100/80 shadow-lg shadow-amber-100/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HiOutlineBanknotes className="text-2xl text-amber-600" />
                <span className="text-sm font-medium text-slate-600">Treasury Balance</span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-slate-800">
                {balanceLoading ? "..." : balance != null ? `$${Number(balance).toFixed(2)}` : "$0.00"}
              </span>
            </div>
          </div>
        )}

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/90 backdrop-blur-sm border border-amber-100/80 shadow-xl shadow-amber-100/30 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Bank selection */}
              <div className="flex flex-col">
                <label htmlFor="bank_id" className={labelBase}>
                  Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  id="bank_id"
                  name="bank_id"
                  value={form.bank_id}
                  onChange={handleChange}
                  required
                  disabled={banksLoading}
                  className={inputBase}
                >
                  <option value="">
                    {banksLoading ? "Loading banks..." : "Select bank to withdraw from"}
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
              <HiOutlineCurrencyDollar className="text-amber-500 text-base shrink-0" />
              Withdrawal requests are in <span className="font-semibold text-amber-600">USD</span> and require main admin approval before funds are credited to your treasury.
            </p>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_4px_23px_0_rgba(245,158,11,0.4)] hover:shadow-[0_6px_28px_0_rgba(245,158,11,0.5)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 min-w-[200px] justify-center"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <HiOutlineArrowDownTray className="text-lg" />
                    Submit Withdrawal Request
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

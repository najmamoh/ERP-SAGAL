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

  const inputBase = 'soft-field';
  const labelBase = 'soft-label';
  const btnPrimary = 'soft-submit';
  const btnSecondary = 'soft-btn-secondary';

  /* ================= UI ================= */
  return (
    <div className="soft-page">
      <div className="p-3 flex items-center justify-between">
        <h1 className="lg:hidden">
          <SideParsm />
        </h1>
        <div className="navhome p-0 flex w-full justify-end" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card */}
        <div className="soft-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#605BFF] dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
                <HiOutlineArrowDownTray className="text-xl" />
              </div>
              <div>
                <h1 className="soft-title">Make Deposit</h1>
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
          <div className="soft-card mb-4">
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
          className="soft-card"
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

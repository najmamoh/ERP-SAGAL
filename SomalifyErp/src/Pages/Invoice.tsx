"use client";

import InvoiceData from '@/components/ui/InvoiceList';
import { FaPlusCircle } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

function InvoiceP() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600/8 via-violet-500/5 to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-indigo-400/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-violet-400/5 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-blue-50 border border-indigo-500/20">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center border border-indigo-200/60">
                  <HiOutlineDocumentText className="text-2xl text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                    Invoices
                  </h1>
                  <p className="mt-1.5 text-slate-600 text-sm max-w-md">
                    View and manage invoices. Create new invoices or open expenses and purchases.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* <Link
                  to="/Dashboard/Expenses"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <MdTableBar className="text-lg" /> Expenses
                </Link> */}
                <Link
                  to="/Dashboard/Sales/Create"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white hover:bg-slate-50 border border-indigo-200/80 shadow-sm transition-all duration-200"
                >
                  <FaPlusCircle className="text-lg" /> Add New
                </Link>
                {/* <Link
                  to="/Dashboard/Purchases"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-amber-400 hover:bg-amber-300 shadow-md transition-all duration-200"
                >
                  <MdSell className="text-lg" /> Purchase
                </Link> */}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice list card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="p-5 sm:p-6">
            <InvoiceData />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceP;

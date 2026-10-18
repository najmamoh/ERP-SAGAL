import { motion } from 'framer-motion';
import { GoPlus } from "react-icons/go";
import { HiOutlineInbox } from 'react-icons/hi2';
import { RiStockFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import DataPurchases from './DataPurchases';
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CreatePurchase from './CreatePurchase';
import axios from 'axios';
import { Url } from '@/Interfaces';

function AllPurchases() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [totals, setTotals] = useState({
    totalCost: 0,
    totalPaid: 0,
    totalDebt: 0,
    totalDiscount: 0,
    count: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const res = await axios.get(`${Url}/purchases`, {
        params: { page: 1, pageSize: 1000 },
        withCredentials: true,
      });
      const purchaseData = Array.isArray(res.data?.data) ? res.data.data : [];
      setTotals(
        purchaseData.reduce(
          (acc: typeof totals, p: any) => {
            const qty = Number(p.purchase_qty) || 0;
            const cost = Number(p.item_cost) || 0;
            const paid = Number(p.paid_amount) || 0;
            const debt = Number(p.purchase_debt) || 0;
            const discount = Number(p.purchase_discount) || 0;
            return {
              totalCost: acc.totalCost + qty * cost,
              totalPaid: acc.totalPaid + paid,
              totalDebt: acc.totalDebt + debt,
              totalDiscount: acc.totalDiscount + discount,
              count: acc.count + 1,
            };
          },
          { totalCost: 0, totalPaid: 0, totalDebt: 0, totalDiscount: 0, count: 0 }
        )
      );
    } catch {
      /* keep last stats */
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
      <div className='w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6'>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6'>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              className="relative p-2.5 rounded-[4px] bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
            >
              <HiOutlineInbox className="text-white text-xl" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-white bg-green-500 rounded-full"
              />
            </motion.div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400 flex items-center gap-2'>
                Purchases
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg"
                >
                  📦
                </motion.span>
              </h1>
              <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2'>
                <span>✨</span>
                Manage your purchase orders and inventory
              </p>
            </div>
          </div>
          
          <div className='flex items-center gap-3 flex-wrap'>
            <motion.button
              onClick={() => setIsCreateOpen(true)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className='flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 text-white rounded-[4px] font-medium text-sm shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group'
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r rounded from-white/0 via-white/20 to-white/0"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <GoPlus className="text-lg relative z-10" />
              <span className="relative z-10">Add New</span>
            </motion.button>
            <Link to={"Alert"}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-[4px] font-semibold text-sm shadow-lg hover:shadow-xl transition-all'
              >
                <RiStockFill className="text-base" />
                <span>Low Stock</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Total Amount Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Cost</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">${totals.totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{totals.count} items</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Paid</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${totals.totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Debt</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">${totals.totalDebt.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">${(totals.totalPaid + totals.totalDebt).toFixed(2)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Paid + Debt</p>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-[10px] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📋
            </motion.span>
            Purchase List
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All your purchases in one place</p>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="min-w-0 w-full" style={{ maxWidth: '100%' }}>
            <DataPurchases key={tableKey} />
          </div>
        </div>
      </motion.div>

      {/* Create Purchase Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl w-[95vw] overflow-hidden border-0 rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Purchase
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new purchase order to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <CreatePurchase
              onSuccess={() => {
                setIsCreateOpen(false);
                loadStats();
                setTableKey((k) => k + 1);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default AllPurchases;

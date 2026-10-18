import { motion } from 'framer-motion';
import { GoPlus } from "react-icons/go";
import { HiOutlineShoppingCart } from 'react-icons/hi2';
import { FiDollarSign, FiCalendar } from 'react-icons/fi';
import { BsGraphUpArrow } from 'react-icons/bs';
import { useState, useEffect, useCallback } from 'react';
import SaleListData from './AllSales';
import axios from 'axios';
import { Url } from '@/Interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SalesForm } from '@/components/ui/SalesForm';

function SaleDTa() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [thisMonthSales, setThisMonthSales] = useState(0);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const headers: Record<string, string> = {};
      if (userInfo.accessToken) headers.Authorization = `Bearer ${userInfo.accessToken}`;
      const res = await axios.get(`${Url}/sales`, {
        params: { page: 1, pageSize: 1000 },
        headers,
        withCredentials: true,
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const now = new Date();
      setTotalSales(res.data?.total ?? data.length);
      setTotalRevenue(data.reduce((sum: number, sale: { received_amount?: string }) => sum + (parseFloat(sale.received_amount || '0')), 0));
      setThisMonthSales(data.filter((sale: { created_at?: string }) => {
        const createdDate = new Date(sale.created_at || '');
        return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
      }).length);
    } catch {
      /* keep last stats */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className='w-full min-h-screen px-4 md:px-6 lg:px-8 py-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
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
              className="relative p-2.5 rounded bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
            >
              <HiOutlineShoppingCart className="text-white text-xl" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full"
              />
            </motion.div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400 flex items-center gap-2'>
                Sales
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg"
                >
                  💰
                </motion.span>
              </h1>
              <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2'>
                <span>✨</span>
                View and manage all your sales transactions
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateOpen(true)}
            className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 text-white rounded font-semibold text-sm shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group'
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r rounded from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <GoPlus className="text-lg relative z-10" />
            <span className="relative z-10">Create Sale</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-800/30 dark:to-blue-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <span>💰</span>
                  Total Sales
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    totalSales.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded bg-gradient-to-br from-slate-600 to-blue-600 shadow-lg">
                <FiDollarSign className="text-white text-lg" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <span>📊</span>
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <BsGraphUpArrow className="text-white text-lg" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-100 to-slate-100 dark:from-indigo-900/30 dark:to-slate-800/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <span>📅</span>
                  This Month
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    thisMonthSales.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded bg-gradient-to-br from-indigo-600 to-slate-600 shadow-lg">
                <FiCalendar className="text-white text-lg" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded shadow-xl dark:border-gray-700 overflow-hidden"
      >
        <div className="p-5 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📋
            </motion.span>
            Sale List
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All your sales in one place</p>
        </div>
        <div className="overflow-x-auto">
          <SaleListData key={tableKey} />
        </div>
      </motion.div>

      {/* Create Sale Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl w-[95vw] overflow-hidden border-0 rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Sale
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new sale to your system. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <SalesForm 
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
  )
}

export default SaleDTa
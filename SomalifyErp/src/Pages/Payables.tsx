import Payabletable from '@/components/ui/PayAbletaple'
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiSecurePaymentLine, RiMoneyDollarCircleLine, RiFileList3Line } from 'react-icons/ri';
import { HiArrowTrendingDown, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import axios from 'axios';
import { Url } from '@/Interfaces';

function Payables() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDebt: 0,
    totalCost: 0,
    totalPaid: 0,
    totalItems: 0,
    paymentProgress: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const res = await axios.get(`${Url}/payables/products`, { withCredentials: true });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      const totalDebt = data.reduce((acc: number, item: any) => acc + parseFloat(String(item.debt ?? '0')), 0);
      const totalCost = data.reduce((acc: number, item: any) => acc + parseFloat(String(item.total_cost ?? '0')), 0);
      const totalPaid = data.reduce((acc: number, item: any) => acc + parseFloat(String(item.paid_amount ?? '0')), 0);
      setStats({
        totalDebt,
        totalCost,
        totalPaid,
        totalItems: data.length,
        paymentProgress: totalCost > 0 ? (totalPaid / totalCost) * 100 : 0,
      });
    } catch {
      /* keep last stats */
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('userInfo')) {
      navigate('/');
    } else {
      loadStats();
    }
  }, [navigate, loadStats]);

  const statCards = [
    {
      title: 'Total Debt',
      value: `$${stats.totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <RiSecurePaymentLine className="w-6 h-6" />,
      gradient: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      trend: 'outstanding'
    },
    {
      title: 'Total Cost',
      value: `$${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <HiOutlineCurrencyDollar className="w-6 h-6" />,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      trend: 'total'
    },
    {
      title: 'Total Paid',
      value: `$${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <RiMoneyDollarCircleLine className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      trend: 'paid'
    },
    {
      title: 'Total Items',
      value: stats.totalItems.toString(),
      icon: <RiFileList3Line className="w-6 h-6" />,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      trend: 'items'
    }
  ];

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
      <div className='w-full px-4 md:px-6 lg:px-8 py-6 max-w-[1250px] mx-auto'>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6'>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent dark:from-red-400 dark:via-pink-400 dark:to-red-400 flex items-center gap-3'>
                <RiSecurePaymentLine className="text-red-600 dark:text-red-400" />
                Payables
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base'>
                Track and manage all outstanding payments to vendors
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-red-500/50 flex items-center gap-2'
              >
                <HiArrowTrendingDown className="text-base" />
                <span>Outstanding Payments</span>
              </motion.div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} p-6 shadow-lg border border-white/20 dark:border-gray-700/50 backdrop-blur-sm`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${stat.gradient} text-white`}>
                    {stat.trend}
                  </div>
                </div>
                <h3 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>{stat.title}</h3>
                <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <div className='absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl' />
              </motion.div>
            ))}
          </div>

          {/* Payment Progress Card */}
          {stats.totalCost > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='mb-8 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Payment Progress</h3>
                <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {stats.paymentProgress.toFixed(1)}% Paid
                </span>
              </div>
              <div className='w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.paymentProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className='h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg'
                />
              </div>
              <div className='flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400'>
                <span>Paid: ${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span>Remaining: ${stats.totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
        >
          <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <RiFileList3Line className="text-red-600 dark:text-red-400" />
              Payable Transactions
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
              View and manage all payable items
            </p>
          </div>
          <div className='py-6 px-4 overflow-x-auto'>
            <div className='min-w-0 w-full'>
              <Payabletable />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Payables

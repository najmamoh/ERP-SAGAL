import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { RiStockFill } from 'react-icons/ri';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { FiPackage } from 'react-icons/fi';
import DataAlertItem from '@/components/ui/alertData';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';

function AllPurchasesAlert() {
  const AllPurchaseAlertState = useSelector((state: RootState) => state.AlertItem);
  const purchaseData = Array.isArray(AllPurchaseAlertState?.data?.lowStockProducts)
    ? AllPurchaseAlertState.data.lowStockProducts
    : [];

  const stats = useMemo(() => {
    const total = purchaseData.length;
    const critical = purchaseData.filter((p: any) => {
      const stock = parseInt(p.total_stock || '0', 10);
      const alert = p.product_alert_number || 0;
      return stock <= alert && alert > 0;
    }).length;
    return { total, critical };
  }, [purchaseData]);

  const statCards = [
    {
      title: 'Total Low Stock Items',
      value: stats.total.toString(),
      icon: RiStockFill,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50/90 to-blue-50/90 dark:from-blue-950/40 dark:to-blue-950/40',
      trend: 'items need attention',
      emoji: '⚠️',
    },
    {
      title: 'Critical Level',
      value: stats.critical.toString(),
      icon: HiOutlineExclamationTriangle,
      gradient: 'from-blue-600 to-blue-700',
      bgGradient: 'from-blue-50/90 to-blue-100/90 dark:from-blue-950/40 dark:to-blue-900/40',
      trend: 'below threshold',
      emoji: '🚨',
    },
  ];

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
      <div className='w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6'>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
            <div className='flex items-center gap-3'>
              <Link to="../">
                <button className='p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors'>
                  <IoIosArrowRoundBack className="text-2xl" />
                </button>
              </Link>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3'>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    className="relative p-2.5 rounded-md bg-blue-600 shadow-xl"
                  >
                    <RiStockFill className="text-white text-xl" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-white bg-red-500 rounded-full"
                    />
                  </motion.div>
                  Low Stock Alerts
                </h1>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2'>
                  <span>📦</span>
                  Products below their alert threshold — restock soon
                </p>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6 mb-8'>
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -6 }}
                className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${stat.bgGradient} p-6 shadow-xl shadow-black/5 dark:shadow-black/20 border border-white/60 dark:border-white/10 backdrop-blur-sm`}
              >
                <div className="absolute -top-6 -right-6 text-7xl opacity-20">{stat.emoji}</div>
                <div className='flex items-start justify-between mb-4 relative z-10'>
                  <div className={`p-3.5 rounded-md bg-gradient-to-r ${stat.gradient} text-white shadow-lg`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-md bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 shadow-sm">
                    {stat.trend}
                  </span>
                </div>
                <h3 className='text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 relative z-10'>
                  {stat.title}
                </h3>
                <p className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent relative z-10`}>
                  {AllPurchaseAlertState.isLoading ? (
                    <span className="animate-pulse">—</span>
                  ) : (
                    stat.value
                  )}
                </p>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/20 to-transparent rounded-tl-lg" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
          <div className='p-6 md:p-8 border-b border-gray-200 dark:border-gray-700'>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
                <FiPackage className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                  Products Requiring Restock
                </h2>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                  Current stock below or at alert threshold for each product
                </p>
              </div>
            </div>
          </div>
          <div className='p-4 md:p-6 overflow-x-auto'>
            <div className='min-w-0 w-full'>
              <DataAlertItem />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AllPurchasesAlert;

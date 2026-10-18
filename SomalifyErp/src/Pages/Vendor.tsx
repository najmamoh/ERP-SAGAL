import VendorTable from '@/components/ui/VendorTable';
import { motion } from 'framer-motion';
import { GoPlus } from "react-icons/go";
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { FiUsers, FiCalendar } from 'react-icons/fi';
import { BsGraphUpArrow } from 'react-icons/bs';
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VendorForm } from '@/components/ui/VendorForm';
import axios from 'axios';
import { Url } from '@/Interfaces';

function isThisMonth(dateStr?: string) {
  if (!dateStr) return false;
  const createdDate = new Date(dateStr);
  const now = new Date();
  return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
}

function Vendor() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalVendors, setTotalVendors] = useState(0);
  const [activeVendors, setActiveVendors] = useState(0);
  const [thisMonthVendors, setThisMonthVendors] = useState(0);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const company_id = userInfo.user?.company_id || userInfo.company_id;
      const res = await axios.get(`${Url}/vendors`, {
        params: { page: 1, pageSize: 1000, ...(company_id && { company_id }) },
        withCredentials: true,
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setTotalVendors(res.data?.total ?? data.length);
      setActiveVendors(data.length);
      setThisMonthVendors(data.filter((v: { created_at?: string }) => isThisMonth(v.created_at)).length);
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
    <div className='w-full min-h-screen px-4 md:px-6 lg:px-8 py-6 relative overflow-hidden'>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50/60 to-indigo-100/50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5NDk0OTQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-60 dark:opacity-40" />

      <div className="relative z-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6'>
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              className="relative p-3 rounded-[6px] bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl shadow-blue-500/25"
            >
              <HiOutlineBuildingOffice2 className="text-white text-2xl" />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-gray-900"
              />
            </motion.div>
            <div>
              <h1 className='text-2xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-200 dark:via-blue-300 dark:to-indigo-300'>
                Vendors
              </h1>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                Manage relationships and orders in one place
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateOpen(true)}
            className='flex items-center gap-2.5 px-6 py-3.5 rounded-[6px] font-semibold text-sm text-white bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all relative overflow-hidden group'
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <GoPlus className="text-xl relative z-10" />
            <span className="relative z-10">Add New Vendor</span>
          </motion.button>
        </div>

        {/* Stats Cards - Glass style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Vendors', value: totalVendors, icon: FiUsers, gradient: 'from-slate-500 to-blue-600', bgGlow: 'from-slate-400/20 to-blue-500/20', delay: 0.1 },
            { label: 'Active', value: activeVendors, icon: BsGraphUpArrow, gradient: 'from-blue-500 to-indigo-600', bgGlow: 'from-blue-400/20 to-indigo-500/20', delay: 0.2 },
            { label: 'This Month', value: thisMonthVendors, icon: FiCalendar, gradient: 'from-indigo-500 to-violet-600', bgGlow: 'from-indigo-400/20 to-violet-500/20', delay: 0.3 },
          ].map(({ label, value, icon: Icon, gradient, bgGlow, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative rounded-[6px] p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? '…' : value.toLocaleString()}
                  </h3>
                </div>
                <div className={`p-3 rounded-[6px] bg-gradient-to-br ${gradient} shadow-lg`}>
                  <Icon className="text-white text-lg" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="rounded-[8px] overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 shadow-xl"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-700/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Vendor List
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">All vendors in one place</p>
        </div>
        <div className="overflow-x-auto">
          <VendorTable key={tableKey} />
        </div>
      </motion.div>

      {/* Create Vendor Modal - Glass popup */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl w-[95vw] overflow-hidden border-0 rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/5 dark:ring-white/10">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <div className="h-1 w-full bg-gradient-to-r from-slate-500 via-blue-500 to-indigo-500 rounded-t-3xl" />
          <DialogHeader className="relative px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="p-3 rounded-2xl bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30"
              >
                <HiOutlineBuildingOffice2 className="text-white text-2xl" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Vendor
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Add vendor details below. You can import from Excel or add multiple rows.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="relative max-h-[70vh] overflow-y-auto">
            <VendorForm 
              mode="create" 
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

export default Vendor;

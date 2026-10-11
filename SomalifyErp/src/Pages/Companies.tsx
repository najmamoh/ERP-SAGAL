import CompanyListData from '@/components/ui/CompanyList';
import { motion } from 'framer-motion';
import { GoPlus } from "react-icons/go";
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CompanyForm } from '@/components/ui/CompanyForm';

function hasPermission(permissions: string[] | undefined, perm: string): boolean {
  if (!permissions?.length) return false;
  return permissions.includes(perm);
}

function Companies() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const companyState = useSelector((state: RootState) => state.AllCompanies);
  const adminUser = useSelector((state: RootState) => state.adminWhoami.userData);

  // Permission check: redirect to Home if no companies access
  useEffect(() => {
    const perms = adminUser?.permissions || [];
    const isSuperAdmin = adminUser?.roles?.includes('superAdmin') || adminUser?.roles?.includes('super_admin');
    const canAccess = isSuperAdmin || hasPermission(perms, 'companies:read') || hasPermission(perms, 'companies:dashboard');
    if (adminUser && !canAccess) {
      navigate('/AdminDashboard/Home', { replace: true });
    }
  }, [adminUser, navigate]);

  // Fetch companies on component mount
  useEffect(() => {
    dispatch(getAllCompaniesFn());
  }, [dispatch]);

  // Calculate statistics
  const totalCompanies = companyState.total || 0;
  const activeCompanies = companyState.data?.filter((company) => !company.isBanned).length || 0;
  const bannedCompanies = companyState.data?.filter((company) => company.isBanned).length || 0;

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
              className="relative p-2.5 rounded bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
            >
              <HiOutlineBuildingOffice className="text-white text-xl" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full"
              />
            </motion.div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400 flex items-center gap-2'>
                Branches
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-lg"
                >
                  🏢
                </motion.span>
              </h1>
              <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2'>
                <span>✨</span>
                Manage all registered branches in your system
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/AdminDashboard/Stores/Create')}
              className='flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border-2 border-slate-300 dark:border-gray-600 rounded font-semibold text-sm shadow-lg hover:shadow-xl transition-all'
            >
              <HiOutlineShoppingBag className="text-lg" />
              <span>Create Store</span>
            </motion.button>
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
              <span className="relative z-10">Add New Branch</span>
            </motion.button>
          </div>
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
                  <span>🏢</span>
                  Total Branches
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companyState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    totalCompanies.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded bg-gradient-to-br from-slate-600 to-blue-600 shadow-lg">
                <FiUsers className="text-white text-lg" />
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
                  <span>✅</span>
                  Active
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companyState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    activeCompanies.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <FiCheckCircle className="text-white text-lg" />
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
                  <span>🚫</span>
                  Banned
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companyState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    bannedCompanies.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded bg-gradient-to-br from-indigo-600 to-slate-600 shadow-lg">
                <FiXCircle className="text-white text-lg" />
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:border-gray-700 w-full overflow-hidden"
      >
        <div className="p-5 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📋
            </motion.span>
            Branches List
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All registered branches in one place</p>
        </div>
        <div className="p-4 w-full">
          <CompanyListData />
        </div>
      </motion.div>

      {/* Create Company Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl w-[95vw] overflow-hidden border-0 rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Company
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new company to your system. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <CompanyForm 
              mode="create" 
              onSuccess={() => {
                setIsCreateOpen(false);
                dispatch(getAllCompaniesFn());
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

export default Companies

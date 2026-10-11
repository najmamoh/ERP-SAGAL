import ProductListdata from '@/components/ui/ProductList';
import { motion } from 'framer-motion';
import { GoPlus } from "react-icons/go";
import { HiOutlineCube } from 'react-icons/hi2';
import { FiBox, FiCalendar } from 'react-icons/fi';
import { MdSell, MdTableBar } from 'react-icons/md';
import { BsGraphUpArrow } from 'react-icons/bs';
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useCompanyPermissions } from '@/hooks/useCompanyPermissions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ProductForm } from '@/components/ui/ProductForm';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllProductsFn } from '@/Redux/Slice/getAllProductsSlice';

function Products() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const productState = useSelector((state: RootState) => state.AllProduct);
  const { canCreate } = useCompanyPermissions();

  useEffect(() => {
    dispatch(getAllProductsFn({ page: 1, pageSize: 1000 }));
  }, [dispatch]);

  // Calculate statistics
  const totalProducts = productState.total || 0;
  const activeProducts = productState.data?.length || 0;
  
  // Calculate products created this month
  const thisMonthProducts = productState.data?.filter((product) => {
    const createdDate = new Date(product.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && 
           createdDate.getFullYear() === now.getFullYear();
  }).length || 0;
  return (
    <div className='w-full min-h-screen px-4 md:px-6 lg:px-8 py-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-blue-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
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
              className="relative p-2.5 rounded-md bg-blue-600 shadow-xl"
            >
              <HiOutlineCube className="text-white text-xl" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full"
              />
            </motion.div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2'>
                Products
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
                Manage your product inventory with ease
              </p>
            </div>
          </div>
          
          <div className='flex items-center gap-3 flex-wrap'>
            <Link to="Expenses" className='hidden md:block'>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-sm shadow-lg hover:shadow-xl transition-all'
              >
                <MdTableBar className="text-base" />
                <span>Expenses</span>
              </motion.button>
            </Link>

            {canCreate('products') && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateOpen(true)}
                className='flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-sm shadow-xl hover:shadow-2xl transition-all'
              >
                <GoPlus className="text-lg" />
                <span>Add New Product</span>
              </motion.button>
            )}

            <Link to={"/Dashboard/Purchases"} className='hidden md:block'>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-sm shadow-lg hover:shadow-xl transition-all'
              >
                <MdSell className="text-base" />
                <span>Purchase</span>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-md p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <span>📦</span>
                  Total Products
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {productState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    totalProducts.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded-md bg-blue-600 shadow-lg">
                <FiBox className="text-white text-lg" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-md p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <span>⭐</span>
                  Active
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {productState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    activeProducts.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded-md bg-blue-600 shadow-lg">
                <BsGraphUpArrow className="text-white text-lg" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white dark:bg-gray-800 rounded-md p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <span>📅</span>
                  This Month
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {productState.isLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    thisMonthProducts.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="p-2.5 rounded-md bg-blue-600 shadow-lg">
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-5 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📋
            </motion.span>
            Product List
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All your products in one place</p>
        </div>
        <div className="overflow-x-auto">
          <ProductListdata />
        </div>
      </motion.div>

      {/* Create Product Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 gap-0 max-w-5xl w-[95vw] overflow-hidden border-0 rounded-2xl shadow-2xl max-h-[90vh] z-[100] bg-gradient-to-b from-white to-slate-50/80 dark:from-gray-900 dark:to-slate-900/90 [&>button]:text-white [&>button]:hover:bg-white/20">
          <DialogHeader className="relative p-8 overflow-hidden  bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <HiOutlineCube className="text-2xl" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white drop-shadow-sm">
                  Create New Product
                </DialogTitle>
                <DialogDescription className="text-white/90 text-sm mt-1">
                  Add a new product to your inventory — it only takes a moment ✨
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ProductForm 
              mode="create" 
              onSuccess={() => {
                setIsCreateOpen(false);
                dispatch(getAllProductsFn({ page: 1, pageSize: 1000 }));
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Products
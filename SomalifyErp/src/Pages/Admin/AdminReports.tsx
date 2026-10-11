import  { useState, useEffect } from 'react';
import { FaChartLine, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import { RiMoneyCnyBoxFill, RiMoneyEuroCircleFill, RiShoppingBag3Fill } from 'react-icons/ri';
import { motion } from 'framer-motion';
import MyChart from '@/components/ui/RebortChartsAre';
import Lottie from 'lottie-react';
import Mastercard from '../../assets/mastercard.json';
import { Link } from 'react-router-dom';
import { GetAllIncomeReporFn } from '@/Redux/Slice/Los/Porift';
import { AppDispatch, RootState } from '@/Redux/Store';
import { useSelector, useDispatch } from 'react-redux';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { FiTrendingUp, FiActivity } from 'react-icons/fi';
import { BsGraphUpArrow, BsGraphDownArrow } from 'react-icons/bs';
import { CompanyFilter } from '@/components/ui/CompanyFilter';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';

function AdminReports() {

  const dispatch = useDispatch<AppDispatch>();
  const GetAllincomeState = useSelector((state: RootState) => state.GetIncome);
  const currentDate = new Date();
  
  // Get date 30 days ago
  const pastDate = new Date();
  pastDate.setDate(currentDate.getDate() - 30);

  // Format dates as needed (assuming yyyy-mm-dd format)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set initial state
  const [startDate, setStartDate] = useState(formatDate(pastDate));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const AllCompaniesState = useSelector((state: RootState) => state.AllCompanies);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  useEffect(() => {
    dispatch(getAllCompaniesFn());
  }, [dispatch]);

  // Auto-select first company when companies load (so reports show data without manual selection)
  useEffect(() => {
    if (AllCompaniesState.data?.length && !selectedCompanyId) {
      const firstId = AllCompaniesState.data[0].company_id;
      setSelectedCompanyId(firstId);
      sessionStorage.setItem('reportCompanyId', firstId);
    }
  }, [AllCompaniesState.data, selectedCompanyId]);

  // Persist selected company for child report pages (SaleReport, ExpensesReport, etc.)
  useEffect(() => {
    if (selectedCompanyId) {
      sessionStorage.setItem('reportCompanyId', selectedCompanyId);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (startDate && endDate && selectedCompanyId) {
      dispatch(GetAllIncomeReporFn({ startDate, endDate, company_id: selectedCompanyId }));
    }
  }, [dispatch, startDate, endDate, selectedCompanyId]);

  
  const totalSales = GetAllincomeState.data?.salesInfo
    ? GetAllincomeState.data.salesInfo.reduce((acc, sale) => acc + parseFloat(sale.total_sales || "0"), 0)
    : 0;

  const totalSalesCost = GetAllincomeState.data?.salesInfo
    ? GetAllincomeState.data.salesInfo.reduce((acc, sale) => acc + parseFloat(sale.total_sales_cost || "0"), 0)
    : 0;

  const totalSalariesExpenses = GetAllincomeState.data?.salaryExpenses
    ? GetAllincomeState.data.salaryExpenses.reduce((acc, expense) => acc + parseFloat(expense.total_salaries_expenses || "0"), 0)
    : 0;

  const totalOtherExpenses = GetAllincomeState.data?.otherExpenses
    ? GetAllincomeState.data.otherExpenses.reduce((acc, expense) => acc + parseFloat(expense.total_other_expenses || "0"), 0)
    : 0;

  // Calculate financial metrics
  const netSale = totalSales - totalSalesCost;
  const totalExpenses = totalSalariesExpenses + totalOtherExpenses;
  const income = netSale - totalExpenses;

  const isLoss = income <= 0;

  const adminWhoamiState = useSelector((state: RootState) => state.adminWhoami);
  const adminName = adminWhoamiState.userData?.full_name || 'Admin';

  return (
    <div className='w-full min-h-screen'>
      <div className='w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6'>
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6'>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400'>
                Welcome back, {adminName.split(' ')[0]}! 👋
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base'>
                Here's what's happening with your business today ✨
              </p>
            </div>
            <div className='flex flex-col md:flex-row gap-3 items-start md:items-center'>
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/50 flex items-center gap-2'
              >
                <FiActivity className="text-base" />
                Admin Panel
              </motion.span>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              {/* Company Filter - More Prominent */}
              <div className="flex-1 sm:flex-initial">
                <CompanyFilter 
                  onCompanyChange={setSelectedCompanyId} 
                  selectedCompanyId={selectedCompanyId} 
                />
              </div>
              {/* Date Range */}
              <div className="flex flex-wrap gap-4 flex-1">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={formatDate(currentDate)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
            {selectedCompanyId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400"
              >
                <HiOutlineOfficeBuilding className="text-base" />
                <span>Filtering by selected company</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white dark:bg-gray-800 rounded-[10px] p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                <FaChartLine className="text-white text-xl" />
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                <HiArrowTrendingUp className="text-xs" />
                Sales
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Sales</h3>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${totalSales.toLocaleString()}</h1>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white dark:bg-gray-800  rounded-[10px]  p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
                <RiShoppingBag3Fill className="text-white text-xl" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                <FiTrendingUp className="text-xs" />
                Cost
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Sales Cost</h3>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${totalSalesCost.toLocaleString()}</h1>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white dark:bg-gray-800  rounded-[10px]  p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-amber-600">
                <RiMoneyCnyBoxFill className="text-white text-xl" />
              </div>
              <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                <HiArrowTrendingDown className="text-xs" />
                Expenses
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Expenses</h3>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${totalExpenses.toLocaleString()}</h1>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white dark:bg-gray-800  rounded-[10px]  p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full bg-gradient-to-br ${isLoss ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-teal-600'}`}>
                <FaDollarSign className="text-white text-xl" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${isLoss ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'}`}>
                {isLoss ? <BsGraphDownArrow className="text-xs" /> : <BsGraphUpArrow className="text-xs" />}
                {isLoss ? 'Loss' : 'Profit'}
              </span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Net Income</h3>
            <h1 className={`text-2xl md:text-3xl font-bold ${isLoss ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              ${income.toLocaleString()}
            </h1>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Quick Reports
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={"SaleReport"}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-6  rounded-[10px]  text-white shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <FaChartLine className="text-3xl mb-2" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Sales Report</h3>
                  <p className="text-sm text-white/80">View sales analytics</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span>View Report</span>
                    <HiArrowTrendingUp className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link to={"ExpensesReport"}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-6 rounded-[10px] text-white shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <RiMoneyCnyBoxFill className="text-3xl mb-2" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Expenses</h3>
                  <p className="text-sm text-white/80">Track expenses</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span>View Report</span>
                    <HiArrowTrendingUp className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link to={"UnpaidExpensesReport"}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 rounded-[10px] text-white shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <RiMoneyEuroCircleFill className="text-3xl mb-2" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Unpaid Expenses</h3>
                  <p className="text-sm text-white/80">Unpaid & partial paid</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span>View Report</span>
                    <HiArrowTrendingUp className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link to={"PurchasesReport"}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-6 rounded-[10px] text-white shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <FaShoppingCart className="text-3xl mb-2" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Purchases</h3>
                  <p className="text-sm text-white/80">Purchase history</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span>View Report</span>
                    <HiArrowTrendingUp className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link to={"Income"}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 rounded-[10px] text-white shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <RiMoneyEuroCircleFill className="text-3xl mb-2" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Profit/Loss</h3>
                  <p className="text-sm text-white/80">Income statement</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span>View Report</span>
                    <HiArrowTrendingUp className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <MyChart companyId={selectedCompanyId} />
          </div>
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-6 text-white shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${isLoss ? 'text-red-200' : 'text-emerald-200'}`}>
                  {isLoss ? '📉 Loss' : '📈 Profit'}
                </h2>
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <RiMoneyEuroCircleFill className="text-2xl" />
                </div>
              </div>
              <p className="text-white/80 text-sm mb-2">Net Income</p>
              <h1 className={`font-bold text-4xl md:text-5xl mb-4 ${isLoss ? 'text-red-200' : 'text-emerald-200'}`}>
                ${income.toLocaleString()}
              </h1>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
                <div className="w-full h-32">
                  <Lottie animationData={Mastercard} loop={true} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminReports;

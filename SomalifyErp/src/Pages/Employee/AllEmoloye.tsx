import EmployersData from "@/components/ui/EmployersData";

import { GoPlus } from "react-icons/go";
import { BsCashCoin } from "react-icons/bs";
import { motion } from 'framer-motion';
import { HiOutlineUserGroup, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import { FiUsers } from 'react-icons/fi';
import { RiFileList3Line } from 'react-icons/ri';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/Redux/Store';
import { getAllEmployersFn } from '@/Redux/Slice/Employe/AllEmloyers';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EmployeeForm } from '@/components/ui/EmployeeForm';
import { CompanyFilter } from '@/components/ui/CompanyFilter';
import { Link } from "react-router-dom";

function AllEmoloye() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const hasInitializedCompany = useRef(false);
  const dispatch = useDispatch<AppDispatch>();
  const AllEmployeesState = useSelector((state: RootState) => state.AllEmployes);
  const AllCompaniesState = useSelector((state: RootState) => state.AllCompanies);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const roles = userInfo.user?.roles || userInfo.roles || [];
  const isSuperAdmin = roles.includes('superAdmin') || roles.includes('super_admin');
  const userCompanyId = userInfo.user?.company_id || userInfo.company_id;

  useEffect(() => {
    if (isSuperAdmin) dispatch(getAllCompaniesFn());
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    if (hasInitializedCompany.current) return;
    if (isSuperAdmin && AllCompaniesState.data?.length) {
      setSelectedCompanyId(AllCompaniesState.data[0].company_id);
      hasInitializedCompany.current = true;
    } else if (!isSuperAdmin && userCompanyId) {
      setSelectedCompanyId(userCompanyId);
      hasInitializedCompany.current = true;
    }
  }, [isSuperAdmin, AllCompaniesState.data, userCompanyId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = AllEmployeesState.data?.length || 0;
    const totalSalary = AllEmployeesState.data?.reduce((acc, emp) => {
      return acc + parseFloat(emp.salary_amount || '0');
    }, 0) || 0;
    const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;

    return {
      totalEmployees,
      totalSalary,
      avgSalary,
    };
  }, [AllEmployeesState.data]);

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toString(),
      icon: <HiOutlineUserGroup className="w-6 h-6" />,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      trend: 'active'
    },
    {
      title: 'Total Salary',
      value: `$${stats.totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <HiOutlineCurrencyDollar className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      trend: 'monthly'
    },
    {
      title: 'Average Salary',
      value: `$${stats.avgSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <FiUsers className="w-6 h-6" />,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      trend: 'per employee'
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
              <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400 flex items-center gap-3'>
                <HiOutlineUserGroup className="text-blue-600 dark:text-blue-400" />
                Employees
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base'>
                Manage your team members and their information
              </p>
            </div>
            <div className='flex items-center gap-3 flex-wrap'>
              {isSuperAdmin && (
                <CompanyFilter
                  selectedCompanyId={selectedCompanyId}
                  onCompanyChange={(id) => {
                    setSelectedCompanyId(id);
                    if (id) dispatch(getAllEmployersFn(id));
                  }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={"salaries"}>
                  <button className='px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-[4px] text-sm font-semibold shadow-lg shadow-teal-500/50 hover:shadow-teal-500/70 transition-all duration-200 flex items-center gap-2'>
                    <BsCashCoin className="text-base" />
                    <span>Salaries</span>
                  </button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className='px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-[4px] text-sm font-semibold shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-200 flex items-center gap-2'
                >
                  <GoPlus className="text-base" />
                  <span>Add New</span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 mb-8'>
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`relative overflow-hidden rounded-[10px] bg-gradient-to-br ${stat.bgGradient} p-6 shadow-lg border border-white/20 dark:border-gray-700/50 backdrop-blur-sm`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className={`p-2 rounded-[5px] bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className={`text-xs px-4 py-1 rounded-full bg-gradient-to-r ${stat.gradient} text-white`}>
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
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
        >
          <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <RiFileList3Line className="text-blue-600 dark:text-blue-400" />
              Employee List
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
              View and manage all employees
            </p>
          </div>
          <div className='p-4 overflow-x-auto'>
            <div className='min-w-0 w-full'>
              <EmployersData
                selectedCompanyId={selectedCompanyId}
                onRefresh={() => dispatch(getAllEmployersFn(isSuperAdmin && selectedCompanyId ? selectedCompanyId : undefined))}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Employee Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 gap-0 max-w-5xl w-[95vw] overflow-hidden border-0 rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Employee
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add employee details below. You can import from Excel or add multiple rows.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <EmployeeForm
              onSuccess={() => {
                setIsCreateOpen(false);
                dispatch(getAllEmployersFn(isSuperAdmin ? selectedCompanyId : undefined));
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AllEmoloye

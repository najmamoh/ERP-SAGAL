import { GoPlus } from "react-icons/go";
import { Link } from "react-router-dom";
import SalariesData from "@/components/ui/SalareisDta";
import { IoIosArrowRoundBack } from "react-icons/io";
import { motion } from 'framer-motion';
import { BsCashCoin, BsCashStack } from "react-icons/bs";
import { HiOutlineCalendar } from 'react-icons/hi2';
import { RiFileList3Line } from 'react-icons/ri';
import { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/Redux/Store';
import { getAllSalariesFn } from '@/Redux/Slice/Salareis/AllSalarySlice';
import { delSalaryFn, resetSalaryDelete } from '@/Redux/Slice/Salareis/DeleteSalaryslice';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { CompanyFilter } from '@/components/ui/CompanyFilter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SalaryForm } from '@/components/ui/SalaryForm';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function Allsalary() {
  const dispatch = useDispatch<AppDispatch>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updateSalaryId, setUpdateSalaryId] = useState<number | null>(null);
  const [deleteSalary, setDeleteSalary] = useState<{ id: number; employeeName: string } | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const AllSalariesState = useSelector((state: RootState) => state.AllSalaries);
  const DeleteSalaryState = useSelector((state: RootState) => state.DeleteSalary);
  const AllCompaniesState = useSelector((state: RootState) => state.AllCompanies);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const roles = userInfo.user?.roles || userInfo.roles || [];
  const isSuperAdmin = roles.includes('superAdmin') || roles.includes('super_admin');
  const userCompanyId = userInfo.user?.company_id || userInfo.company_id;

  useEffect(() => {
    if (isSuperAdmin) dispatch(getAllCompaniesFn());
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin && AllCompaniesState.data?.length && !selectedCompanyId) {
      setSelectedCompanyId(AllCompaniesState.data[0].company_id);
    } else if (!isSuperAdmin && userCompanyId && !selectedCompanyId) {
      setSelectedCompanyId(userCompanyId);
    }
  }, [isSuperAdmin, AllCompaniesState.data, userCompanyId, selectedCompanyId]);

  useEffect(() => {
    if (DeleteSalaryState.isSuccess) {
      toast.success('Salary deleted successfully.');
      dispatch(resetSalaryDelete());
      setDeleteSalary(null);
      dispatch(getAllSalariesFn());
    }
    if (DeleteSalaryState.isError) {
      toast.error(DeleteSalaryState.errorMsg || 'Failed to delete salary.');
      dispatch(resetSalaryDelete());
    }
  }, [DeleteSalaryState.isSuccess, DeleteSalaryState.isError, DeleteSalaryState.errorMsg, dispatch]);

  const stats = useMemo(() => {
    const totalSalaries = AllSalariesState.data?.length || 0;
    const totalPaid = AllSalariesState.data?.reduce((acc, salary) => {
      return acc + parseFloat(salary.paid_amount || '0');
    }, 0) || 0;
    const now = new Date();
    const thisMonthSalaries = AllSalariesState.data?.filter((salary) => {
      const salaryDate = new Date(salary.date);
      return salaryDate.getMonth() === now.getMonth() && 
             salaryDate.getFullYear() === now.getFullYear();
    }) || [];
    const thisMonthTotal = thisMonthSalaries.reduce((acc, salary) => {
      return acc + parseFloat(salary.paid_amount || '0');
    }, 0);
    return {
      totalSalaries,
      totalPaid,
      thisMonthTotal,
      thisMonthCount: thisMonthSalaries.length,
    };
  }, [AllSalariesState.data]);

  const statCards = [
    {
      title: 'Total Paid',
      value: `$${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: BsCashStack,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/40',
      trend: 'all time',
      emoji: '💰'
    },
    {
      title: 'This Month',
      value: `$${stats.thisMonthTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: HiOutlineCalendar,
      gradient: 'from-sky-400 via-teal-400 to-emerald-400',
      bgGradient: 'from-sky-50/90 via-teal-50/80 to-emerald-50/90 dark:from-sky-950/40 dark:via-teal-950/30 dark:to-emerald-950/40',
      trend: `${stats.thisMonthCount} payments`,
      emoji: '📅'
    },
    {
      title: 'Total Payments',
      value: stats.totalSalaries.toString(),
      icon: BsCashCoin,
      gradient: 'from-violet-400 via-purple-400 to-fuchsia-400',
      bgGradient: 'from-violet-50/90 via-purple-50/80 to-fuchsia-50/90 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-fuchsia-950/40',
      trend: 'records',
      emoji: '✨'
    }
  ];

  return (
    <div className='min-h-screen w-full relative overflow-hidden'>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800" />

      <div className='relative z-10 w-full px-4 md:px-6 lg:px-8 py-6 max-w-[1250px] mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
            <div className='flex items-center gap-3'>
              <Link to="..">
                <button className='p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors'>
                  <IoIosArrowRoundBack className="text-2xl" />
                </button>
              </Link>
              <div>
                <h1 className='text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
                  <BsCashCoin className="text-teal-600 dark:text-teal-400" />
                  Salaries
                </h1>
                <p className='text-gray-500 dark:text-gray-400 mt-0.5 text-sm'>
                  Track and manage salary payments
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              {isSuperAdmin && (
                <CompanyFilter
                  selectedCompanyId={selectedCompanyId}
                  onCompanyChange={(id) => setSelectedCompanyId(id)}
                />
              )}
              <button
                onClick={() => setIsCreateOpen(true)}
                className='px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-sm font-medium transition-colors flex items-center gap-2'
              >
                <GoPlus className="text-base" />
                Add New Payment
              </button>
            </div>
          </div>

          {/* Adorable stat cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8'>
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -8, rotate: 1 }}
                className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${stat.bgGradient} p-6 shadow-xl shadow-black/5 dark:shadow-black/20 border border-white/60 dark:border-white/10 backdrop-blur-sm`}
              >
                <div className="absolute -top-6 -right-6 text-7xl opacity-20">{stat.emoji}</div>
                <div className='flex items-start justify-between mb-4 relative z-10'>
                  <div className={`p-3.5 rounded-lg bg-gradient-to-r ${stat.gradient} text-white shadow-lg`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 shadow-sm`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className='text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 relative z-10'>{stat.title}</h3>
                <p className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent relative z-10`}>
                  {stat.value}
                </p>
                <div className='absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/20 to-transparent rounded-tl-lg' />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className='relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700'
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600 dark:bg-teal-500" />
          <div className='p-6 md:p-8 border-b border-gray-200 dark:border-gray-700'>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                <RiFileList3Line className="text-2xl text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                  Salary Payments
                </h2>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                  View and manage all salary payment records
                </p>
              </div>
            </div>
          </div>
          <div className='p-4 md:p-6 overflow-x-auto'>
            <div className='min-w-0 w-full'>
              <SalariesData
                onEdit={(salaryId) => setUpdateSalaryId(salaryId)}
                onDelete={(id, employeeName) => setDeleteSalary({ id, employeeName })}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Salary Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden border-0 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Create Salary Payment
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Record a new salary payment for an employee
            </DialogDescription>
          </DialogHeader>
          <SalaryForm
            mode="create"
            companyId={isSuperAdmin ? selectedCompanyId || undefined : undefined}
            onSuccess={() => {
              setIsCreateOpen(false);
              dispatch(getAllSalariesFn());
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Update Salary Modal */}
      <Dialog open={updateSalaryId !== null} onOpenChange={(open) => !open && setUpdateSalaryId(null)}>
        <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden border-0 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Update Salary Payment
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Edit the salary payment details
            </DialogDescription>
          </DialogHeader>
          {updateSalaryId !== null && (
            <SalaryForm
              mode="update"
              salaryId={updateSalaryId}
              onSuccess={() => {
                setUpdateSalaryId(null);
                dispatch(getAllSalariesFn());
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteSalary !== null} onOpenChange={(open) => !open && setDeleteSalary(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Salary Payment
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this salary payment{deleteSalary ? ` for ${deleteSalary.employeeName}` : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setDeleteSalary(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteSalary) {
                  dispatch(delSalaryFn(deleteSalary.id));
                  setDeleteSalary(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

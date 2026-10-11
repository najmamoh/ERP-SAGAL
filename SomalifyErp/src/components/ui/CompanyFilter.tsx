import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
import { motion } from 'framer-motion';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';

interface CompanyFilterProps {
  onCompanyChange: (companyId: string) => void;
  selectedCompanyId?: string;
  /** When false, hide the "Filter by Company" label (e.g. when used with custom label like "Show expenses for:") */
  showLabel?: boolean;
}

export const CompanyFilter = ({ onCompanyChange, selectedCompanyId, showLabel = true }: CompanyFilterProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const AllCompaniesState = useSelector((state: RootState) => state.AllCompanies);
  const GetOneCompanyState = useSelector((state: RootState) => state.GetOneCompanay);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isAdminDashboard = window.location.pathname.startsWith('/AdminDashboard');
  const roles = userInfo.user?.roles || userInfo.roles || [];
  const isMainAdmin = isAdminDashboard && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));
  const userCompanyId = userInfo.user?.company_id || userInfo.company_id;
  const [userCompany, setUserCompany] = useState<any>(null);

  // Fetch companies on mount if admin user
  useEffect(() => {
    if (isMainAdmin) {
      // Admin users can see all companies
      dispatch(getAllCompaniesFn());
    } else if (userCompanyId) {
      // For regular users, fetch their own company
      dispatch(getOneCompanayFN(userCompanyId));
    }
  }, [dispatch, isMainAdmin, userCompanyId]);

  // Re-fetch on component mount/refresh to ensure data is loaded
  useEffect(() => {
    // Ensure data is fetched even if state was cleared on refresh
    if (isMainAdmin && (!AllCompaniesState.data || AllCompaniesState.data.length === 0) && !AllCompaniesState.isLoading) {
      dispatch(getAllCompaniesFn());
    } else if (!isMainAdmin && userCompanyId && (!GetOneCompanyState.data || !GetOneCompanyState.data.company_id) && !GetOneCompanyState.isLoading) {
      dispatch(getOneCompanayFN(userCompanyId));
    }
  }, [dispatch, isMainAdmin, userCompanyId, AllCompaniesState.data, AllCompaniesState.isLoading, GetOneCompanyState.data, GetOneCompanyState.isLoading]);

  // Set user company when data is loaded
  useEffect(() => {
    if (!isMainAdmin && GetOneCompanyState.data && GetOneCompanyState.data.company_id) {
      setUserCompany(GetOneCompanyState.data);
    }
  }, [GetOneCompanyState.data, isMainAdmin]);

  // Build companies list: admin sees all; others see their company once loaded
  const companiesList = isMainAdmin
    ? (AllCompaniesState.data ?? [])
    : userCompany
      ? [userCompany]
      : [];
  const isLoading = isMainAdmin ? AllCompaniesState.isLoading : GetOneCompanyState.isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full md:w-auto min-w-[200px]"
    >
      <div className="flex flex-col gap-1">
        {showLabel && (
          <label
            htmlFor="company-filter"
            className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1"
          >
            <HiOutlineOfficeBuilding className="text-sm" />
            {isMainAdmin ? 'Filter by Company' : 'Company'}
          </label>
        )}
        <select
          id="company-filter"
          value={selectedCompanyId || ''}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="w-full min-w-[180px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
        >
          {isLoading ? (
            <option value="">Loading...</option>
          ) : isMainAdmin ? (
            <>
              <option value="">All Companies</option>
              {(AllCompaniesState.data ?? []).map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company_name}
                </option>
              ))}
            </>
          ) : (
            <>
              <option value="">Select company</option>
              {companiesList.map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company_name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    </motion.div>
  );
};

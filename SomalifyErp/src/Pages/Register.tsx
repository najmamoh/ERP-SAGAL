import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { toast } from 'react-hot-toast';
import { RegisterFn, resetRegisterState } from '@/Redux/Slice/RegisterSlice';
import { createMainUserFn, resetMainUsers } from '@/Redux/Slice/MainUsersSlice';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { getAllRolesFn } from '@/Redux/Slice/RolesManagementSlice';
import axios from 'axios';
import { Url } from '@/Interfaces';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import {
  HiOutlineBuildingOffice,
  HiOutlineShieldCheck,
  HiCheck,
} from 'react-icons/hi2';

function Register() {
  const [full_name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const isMainUserCreate = location.pathname.includes('/MainUser/Create');

  const { isLoading } = useSelector(
    (state: RootState) => state.user
  );
  const mainUsersState = useSelector((state: RootState) => state.mainUsers);
  const AllCompaniesState = useSelector((state: RootState) => state.AllCompanies);
  const rolesState = useSelector((state: RootState) => state.rolesManagement);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRoles = userInfo.user?.roles || userInfo.roles || [];
  const isSuperAdmin =
    userRoles.includes('superAdmin') || userRoles.includes('super_admin');

  // Fetch companies and roles on mount
  useEffect(() => {
    dispatch(getAllRolesFn());
    // Fetch companies when on Admin Dashboard creating company user (superAdmin or admin)
    if (isAdminDashboard && !isMainUserCreate) {
      dispatch(getAllCompaniesFn());
    } else if (isSuperAdmin) {
      dispatch(getAllCompaniesFn());
    }
  }, [dispatch, isSuperAdmin, isAdminDashboard, isMainUserCreate]);

  const allRoles = Array.isArray(rolesState.data) ? rolesState.data : [];

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  // Assign roles to a newly created user
  const assignRoles = async (userId: number, isMain: boolean) => {
    if (selectedRoleIds.length === 0) return;
    setAssigning(true);
    const companyId = (isAdminDashboard || isSuperAdmin) ? selectedCompanyId : userInfo.company_id || userInfo.user?.company_id;
    try {
      for (const roleId of selectedRoleIds) {
        if (isMain) {
          await axios.post(
            `${Url}/roles/${roleId}/main-users/${userId}`,
            {},
            { withCredentials: true }
          );
        } else {
          await axios.post(
            `${Url}/roles/${roleId}/users/${userId}`,
            { company_id: companyId },
            { withCredentials: true }
          );
        }
      }
      toast.success(`${selectedRoleIds.length} role(s) assigned`);
    } catch {
      toast.error('User created but failed to assign some roles');
    } finally {
      setAssigning(false);
    }
  };

  // Handle company user creation
  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!full_name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isMainUserCreate) {
      // Create main user
      const res = await dispatch(
        createMainUserFn({ full_name, email, password })
      );
      if (createMainUserFn.fulfilled.match(res)) {
        const newUserId = res.payload?.user?.id;
        toast.success('Main user created!', { id: 'registerToast' });
        if (newUserId && selectedRoleIds.length > 0) {
          await assignRoles(newUserId, true);
        }
        resetForm();
        dispatch(resetMainUsers());
      } else {
        toast.error(
          (res.payload as string) || 'Failed to create main user',
          { id: 'registerToast' }
        );
      }
    } else {
      // Create company user
      const companyId = (isAdminDashboard || isSuperAdmin)
        ? selectedCompanyId
        : userInfo.company_id || userInfo.user?.company_id;

      if (!companyId) {
        toast.error('Please select a company');
        return;
      }

      const data = { full_name, email, password, company_id: companyId };
      const res = await dispatch(RegisterFn(data));

      if (RegisterFn.fulfilled.match(res)) {
        toast.success('Company user created!', { id: 'registerToast' });

        // Get user_id from the response payload
        const newUserId = (res.payload as any)?.user?.user_id;
        if (newUserId && selectedRoleIds.length > 0) {
          await assignRoles(newUserId, false);
        }
        resetForm();
        dispatch(resetRegisterState());
      } else {
        toast.error(
          (res.payload as string) || 'Failed to create user',
          { id: 'registerToast' }
        );
        dispatch(resetRegisterState());
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setSelectedCompanyId('');
    setSelectedRoleIds([]);
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 transition-all duration-200';
  const labelBase =
    'text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block';

  const isSubmitting = isLoading || mainUsersState.isLoading || assigning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
        {/* Header card */}
        <div className="mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-lg shadow-indigo-100/50 dark:shadow-slate-900/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  isMainUserCreate
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-200/60 dark:shadow-purple-900/30'
                    : 'bg-gradient-to-br from-indigo-400 to-violet-500 shadow-indigo-200/60 dark:shadow-indigo-900/30'
                }`}
              >
                <FiUserPlus className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {isMainUserCreate ? 'Create Main User' : 'Create Company User'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {isMainUserCreate
                    ? 'Add a system administrator with full access'
                    : 'Add a new user to a company team'}
                </p>
              </div>
            </div>
            {isAdminDashboard && (
              <Link
                to="/AdminDashboard/User"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-700/80 shadow-sm transition-all shrink-0"
              >
                All Users
              </Link>
            )}
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={submitHandler}
          className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-xl shadow-indigo-100/30 dark:shadow-slate-900/30 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            {/* Basic Info */}
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="flex flex-col">
                <label htmlFor="full_name" className={labelBase}>
                  Full name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-indigo-500 text-lg" />
                  <input
                    id="full_name"
                    type="text"
                    value={full_name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className={`${inputBase} pl-10`}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className={labelBase}>
                  Email *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-indigo-500 text-lg" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className={`${inputBase} pl-10`}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className={labelBase}>
                  Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-indigo-500 text-lg" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className={`${inputBase} pl-10`}
                    required
                  />
                </div>
              </div>

              {/* Company selection — for company user creation on Admin Dashboard */}
              {!isMainUserCreate && (isAdminDashboard || isSuperAdmin) && (
                <div className="flex flex-col sm:col-span-2 lg:col-span-3">
                  <label htmlFor="company" className={labelBase}>
                    Company *
                  </label>
                  <div className="relative">
                    <HiOutlineBuildingOffice className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-indigo-500 text-lg" />
                    <select
                      id="company"
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className={`${inputBase} pl-10 appearance-none cursor-pointer`}
                      required
                    >
                      <option value="">Select Company</option>
                      {AllCompaniesState.isLoading ? (
                        <option value="" disabled>Loading companies...</option>
                      ) : Array.isArray(AllCompaniesState.data) && AllCompaniesState.data.length > 0 ? (
                        AllCompaniesState.data.map((company: any) => (
                          <option key={company.company_id} value={company.company_id}>
                            {company.company_name} ({company.company_id})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No companies available</option>
                      )}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Assign Roles Section */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineShieldCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Assign Roles
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                  (optional — can also assign later)
                </span>
              </div>

              {rolesState.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Loading roles...
                </div>
              ) : allRoles.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No roles created yet. Go to{' '}
                  <Link
                    to={
                      isAdminDashboard
                        ? '/AdminDashboard/Roles'
                        : '/Dashboard/Roles'
                    }
                    className="text-indigo-600 underline"
                  >
                    Roles Management
                  </Link>{' '}
                  to create roles first.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allRoles.map((role: any) => {
                    const isSelected = selectedRoleIds.includes(role.id);
                    const permCount = role.permissions?.length || 0;

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => toggleRole(role.id)}
                        className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-md shadow-indigo-100/50'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        {/* Checkbox */}
                        <div
                          className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all mt-0.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <HiCheck className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {role.name}
                          </p>
                          {role.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {role.description}
                            </p>
                          )}
                          <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">
                            {permCount} permission{permCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedRoleIds.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <HiOutlineShieldCheck className="w-4 h-4" />
                  <span className="font-medium">
                    {selectedRoleIds.length} role{selectedRoleIds.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#605BFF] to-[#3a3799] shadow-[0_4px_23px_0_rgba(96,91,255,0.5)] hover:shadow-[0_6px_28px_0_rgba(96,91,255,0.6)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {assigning ? 'Assigning roles...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FiUserPlus className="text-lg" />
                    {isMainUserCreate ? 'Create Main User' : 'Create Company User'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;

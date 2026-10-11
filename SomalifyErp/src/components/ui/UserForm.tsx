import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { RegisterFn, resetRegisterState } from '@/Redux/Slice/RegisterSlice';
import { UpdateUserFn, resetUserUpdates } from '@/Redux/Slice/UpdateuserSlice';
import { getOneUserComFn } from '@/Redux/Slice/OneUserComSlice';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { createMainUserFn, updateMainUserFn, getOneMainUserFn, resetMainUsers } from '@/Redux/Slice/MainUsersSlice';
import { UserRoleAssignment } from '@/components/ui/UserRoleAssignment';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface UserFormProps {
  mode: 'create' | 'update';
  userType: 'company' | 'main';
  userId?: number;
  selectedUserType?: 'company' | 'main' | null;
  onUserTypeSelect?: (type: 'company' | 'main' | null) => void;
  onSuccess: () => void;
  onClose: () => void;
  initialCompanyId?: string; // Pre-select company when creating user from company list
}

export const UserForm: React.FC<UserFormProps> = ({ 
  mode, 
  userType, 
  userId, 
  selectedUserType,
  onSuccess, 
  onClose,
  initialCompanyId
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [full_name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId || '');
  const [currentUserType, setCurrentUserType] = useState<'company' | 'main' | null>(selectedUserType || null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const roles = userInfo.user?.roles || userInfo.roles || [];
  const isSuperAdmin = roles.includes('superAdmin') || roles.includes('super_admin');

  // Update current user type when selectedUserType changes
  useEffect(() => {
    if (selectedUserType !== undefined) {
      setCurrentUserType(selectedUserType);
    } else if (mode === 'create') {
      setCurrentUserType(null);
    } else {
      setCurrentUserType(userType);
    }
  }, [selectedUserType, mode, userType]);

  // Determine which user type to use
  const activeUserType = mode === 'update' ? userType : (currentUserType || userType);

  // Redux states
  const registerState = useSelector((state: RootState) => state.user);
  const updateUserState = useSelector((state: RootState) => state.UpdateUser);
  const oneUserState = useSelector((state: RootState) => state.GetOneuser);
  const allCompaniesState = useSelector((state: RootState) => state.AllCompanies);
  const mainUsersState = useSelector((state: RootState) => state.mainUsers);

  // Fetch companies if superAdmin and creating company user or admin user
  useEffect(() => {
    if (isSuperAdmin && mode === 'create' && (activeUserType === 'company' || activeUserType === 'main')) {
      dispatch(getAllCompaniesFn());
    }
  }, [dispatch, isSuperAdmin, activeUserType, mode]);

  // Set initial company_id when provided (immediately on mount and when it changes)
  useEffect(() => {
    if (initialCompanyId) {
      setSelectedCompanyId(initialCompanyId);
      console.log('Setting initialCompanyId:', initialCompanyId);
    }
  }, [initialCompanyId]);

  // Fetch user data for update mode
  useEffect(() => {
    if (mode === 'update' && userId) {
      if (activeUserType === 'company') {
        dispatch(getOneUserComFn(userId));
      } else {
        dispatch(getOneMainUserFn(userId));
      }
    }
  }, [mode, userId, activeUserType, dispatch]);

  // Populate form when user data is loaded
  useEffect(() => {
    if (mode === 'update') {
      if (activeUserType === 'company' && oneUserState.data) {
        setName(oneUserState.data.full_name || '');
        setEmail(oneUserState.data.email || '');
        setRole(oneUserState.data.role || '');
        setPassword('');
      } else if (activeUserType === 'main') {
        if (mainUsersState.currentUser) {
          setName(mainUsersState.currentUser.full_name || '');
          setEmail(mainUsersState.currentUser.email || '');
          setPassword('');
        } else if (Array.isArray(mainUsersState.data) && userId) {
          const user = mainUsersState.data.find(u => u.id === userId);
          if (user) {
            setName(user.full_name || '');
            setEmail(user.email || '');
            setPassword('');
          }
        }
      }
    }
  }, [mode, activeUserType, oneUserState.data, mainUsersState.data, userId]);

  // Handle success/error for company users
  useEffect(() => {
    if (activeUserType === 'company') {
      if (mode === 'create' && registerState.isSuccess) {
        toast.success('User created successfully!', { id: 'userForm' });
        handleReset();
        onSuccess();
      }
      if (mode === 'create' && registerState.isError) {
        toast.error(registerState.errorMsg || 'Failed to create user', { id: 'userForm' });
        dispatch(resetRegisterState());
      }
      if (mode === 'update' && updateUserState.IsSuccess) {
        toast.success('User updated successfully!', { id: 'userForm' });
        handleReset();
        onSuccess();
      }
      if (mode === 'update' && updateUserState.isError) {
        toast.error(updateUserState.errorMsg || 'Failed to update user', { id: 'userForm' });
        dispatch(resetUserUpdates());
      }
    }
  }, [registerState, updateUserState, mode, activeUserType, dispatch, onSuccess]);

  // Handle success/error for main users
  useEffect(() => {
    if (activeUserType === 'main') {
      if (mainUsersState.isSuccess) {
        toast.success(mode === 'create' ? 'Admin user created successfully!' : 'Admin user updated successfully!', { id: 'userForm' });
        handleReset();
        onSuccess();
      }
      if (mainUsersState.isError) {
        toast.error(mainUsersState.errorMsg || `Failed to ${mode} admin user`, { id: 'userForm' });
        dispatch(resetMainUsers());
      }
    }
  }, [mainUsersState, mode, activeUserType, dispatch, onSuccess]);

  const handleReset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('');
    setSelectedCompanyId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if user type not selected in create mode
    if (mode === 'create' && !currentUserType) {
      toast.error('Please select user type', { id: 'userForm' });
      return;
    }

    if (activeUserType === 'company') {
      if (mode === 'create') {
        // Validate company_id is required for company users
        // Priority: initialCompanyId (from company list) > selectedCompanyId (from dropdown) > userInfo.company_id
        let finalCompanyId: string | undefined;
        
        if (initialCompanyId) {
          // Use the company_id passed from company list
          finalCompanyId = initialCompanyId;
        } else if (isSuperAdmin) {
          // For superAdmin, use selectedCompanyId from dropdown
          finalCompanyId = selectedCompanyId || undefined;
        } else {
          // For regular users, use their company_id
          finalCompanyId = userInfo.company_id;
        }
        
        if (!finalCompanyId || finalCompanyId.trim() === '') {
          toast.error('Company is required. Please select a company.', { id: 'userForm' });
          console.error('Company ID validation failed:', { initialCompanyId, selectedCompanyId, userInfo: userInfo.company_id });
          return;
        }

        // Validate role is required
        if (!role || role.trim() === '') {
          toast.error('Role is required. Please select a role.', { id: 'userForm' });
          return;
        }

        const data = {
          full_name,
          email,
          password,
          role: role,
          company_id: finalCompanyId,
        };
        
        console.log('Creating company user with data:', data); // Debug log
        dispatch(RegisterFn(data));
      } else if (mode === 'update' && userId) {
        const data = {
          full_name,
          email,
          password,
          role,
          user_id: userId,
        };
        dispatch(UpdateUserFn(data));
      }
    } else if (activeUserType === 'main') {
      if (mode === 'create') {
        const adminData: any = { full_name, email, password };
        if (selectedCompanyId) {
          adminData.company_id = selectedCompanyId;
        }
        dispatch(createMainUserFn(adminData));
      } else if (mode === 'update' && userId) {
        const updateData: any = { id: userId, full_name, email };
        if (password) updateData.password = password;
        if (selectedCompanyId) {
          updateData.company_id = selectedCompanyId;
        }
        dispatch(updateMainUserFn(updateData));
      }
    }
  };

  const isLoading = activeUserType === 'company' 
    ? (mode === 'create' ? registerState.isLoading : updateUserState.isLoading)
    : mainUsersState.isLoading;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New User' : `Update ${activeUserType === 'main' ? 'Admin' : 'Company'} User`}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>


      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              required
              value={full_name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password {mode === 'update' && <span className="text-gray-500 text-xs">(leave empty to keep current)</span>}
            </label>
            <input
              type="password"
              id="password"
              required={mode === 'create'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter password"
            />
          </div>

          {/* Company Selection for Company Users */}
          {activeUserType === 'company' && mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company <span className="text-red-500 text-xs">* Required</span>
              </label>
              
              {/* If initialCompanyId is provided (from company list), show read-only company info */}
              {initialCompanyId ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {allCompaniesState.data?.find(c => c.company_id === initialCompanyId)?.company_name || 'Selected Company'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        User will be created for this company
                      </p>
                    </div>
                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900/40 rounded-full">
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">✓ Selected</span>
                    </div>
                  </div>
                </div>
              ) : isSuperAdmin ? (
                /* Show dropdown only if no initialCompanyId (creating from user management page) */
                <>
                  <select
                    id="companySelect"
                    required
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      !selectedCompanyId ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">-- Select Company --</option>
                    {allCompaniesState.isLoading ? (
                      <option value="" disabled>Loading companies...</option>
                    ) : allCompaniesState.data && allCompaniesState.data.length > 0 ? (
                      allCompaniesState.data.map((company) => (
                        <option key={company.company_id} value={company.company_id}>
                          {company.company_name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No companies available</option>
                    )}
                  </select>
                  {!selectedCompanyId && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      Please select a company from the dropdown above
                    </p>
                  )}
                  {selectedCompanyId && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <span>✓</span>
                      Company selected: {allCompaniesState.data?.find(c => c.company_id === selectedCompanyId)?.company_name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose the company this user will belong to from the dropdown list
                  </p>
                </>
              ) : (
                /* For non-superAdmin users */
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Company: <strong>{userInfo.company_name || 'Your Company'}</strong>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Users will be created for your company automatically
                  </p>
                </div>
              )}
            </div>
          )}


          {/* Company Selection for Admin Users (SuperAdmin only) */}
          {activeUserType === 'main' && isSuperAdmin && mode === 'create' && (
            <div>
              <label htmlFor="adminCompany" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link to Company <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <select
                id="adminCompany"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="">No Company (System Admin)</option>
                {allCompaniesState.data?.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select a company to link this admin user to, or leave as "No Company" for system-wide access
              </p>
            </div>
          )}

          {/* Role Selection for Company Users */}
          {activeUserType === 'company' && mode === 'create' && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role <span className="text-red-500 text-xs">* Required</span>
              </label>
              <select
                id="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  !role ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {!role && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  ⚠️ Role selection is required
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select the role for this company user
              </p>
            </div>
          )}

          {/* Assign Permissions (RBAC Roles) - Update mode only */}
          {mode === 'update' && userId && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {activeUserType === 'company' && oneUserState.data?.company_id && (
                <UserRoleAssignment
                  userId={userId}
                  userType="company"
                  companyId={oneUserState.data.company_id}
                />
              )}
              {activeUserType === 'main' && (
                <UserRoleAssignment userId={userId} userType="main" />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? 'Processing...' 
              : mode === 'create' 
                ? (activeUserType === 'company' ? 'Create Company User' : 'Create Admin User')
                : (activeUserType === 'company' ? 'Update Company User' : 'Update Admin User')
            }
          </motion.button>
        </div>
      </form>
    </div>
  );
};

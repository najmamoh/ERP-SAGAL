
import { getOneUserComFn } from '@/Redux/Slice/OneUserComSlice';
import { getOneMainUserFn } from '@/Redux/Slice/MainUsersSlice';
import { UpdateUserFn } from '@/Redux/Slice/UpdateuserSlice';
import { updateMainUserFn } from '@/Redux/Slice/MainUsersSlice';
import { resetVendorUpdates } from '@/Redux/Slice/updateVEnderSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import { UserRoleAssignment } from '@/components/ui/UserRoleAssignment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiSave } from 'react-icons/fi';
import { HiOutlineShieldCheck, HiOutlineBuildingOffice } from 'react-icons/hi2';

function UpdateUser() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const isMainUserUpdate = location.pathname.includes('/MainUser/Update');
  const toastId = "update";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OneUserState = useSelector((state: RootState) => state.GetOneuser);
  const MainUsersState = useSelector((state: RootState) => state.mainUsers);
  const UpdateUsertate = useSelector((state: RootState) => state.UpdateUser);

  const params = useParams();
  const id = params.user_id;

  const [userData, setUserData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: '',
    user_id: 0,
    company_id: '',
  });

  useEffect(() => {
    if (id) {
      if (isMainUserUpdate) {
        dispatch(getOneMainUserFn(+id));
      } else {
        dispatch(getOneUserComFn(+id));
      }
    }
  }, [id, dispatch, isMainUserUpdate]);

  useEffect(() => {
    if (isMainUserUpdate && MainUsersState.currentUser) {
      const u = MainUsersState.currentUser;
      setUserData({
        full_name: u.full_name || '',
        email: u.email || '',
        password: '',
        role: (u as { role?: string }).role ?? u.user_roles?.[0]?.role?.name ?? '',
        user_id: u.id || 0,
        company_id: '',
      });
    } else if (!isMainUserUpdate && OneUserState.data) {
      setUserData({
        full_name: OneUserState.data.full_name || '',
        email: OneUserState.data.email || '',
        password: '',
        role: OneUserState.data.role || '',
        user_id: OneUserState.data.user_id || 0,
        company_id: OneUserState.data.company_id || '',
      });
    }
  }, [OneUserState.data, MainUsersState.currentUser, isMainUserUpdate]);

  useEffect(() => {
    if (UpdateUsertate.isLoading) {
      toast.loading('Updating User...', { id: toastId });
    }
    if (UpdateUsertate.IsSuccess) {
      toast.success('Successfully updated.', { id: toastId });
      if (isMainUserUpdate) {
        navigate('/AdminDashboard/MainUser');
      } else {
        navigate(isAdminDashboard ? '/AdminDashboard/User' : '/Dashboard/User');
      }
    }
    if (UpdateUsertate.isError) {
      toast.error(UpdateUsertate.errorMsg, { id: toastId });
    }
    if (UpdateUsertate.isLoading || UpdateUsertate.IsSuccess || UpdateUsertate.isError) {
      dispatch(resetVendorUpdates());
    }
  }, [UpdateUsertate.isLoading, UpdateUsertate.IsSuccess, UpdateUsertate.isError, dispatch, navigate, isAdminDashboard, isMainUserUpdate]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isMainUserUpdate) {
      const payload: any = {
        id: +id!,
        full_name: userData.full_name,
        email: userData.email,
      };
      if (userData.password) payload.password = userData.password;
      const res = await dispatch(updateMainUserFn(payload));
      if (updateMainUserFn.fulfilled.match(res)) {
        toast.success('Main user updated!', { id: toastId });
        navigate('/AdminDashboard/MainUser');
      } else {
        toast.error((res.payload as string) || 'Failed to update', { id: toastId });
      }
    } else {
      dispatch(UpdateUserFn({ ...userData, role: userData.role }));
    }
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 transition-all duration-200';
  const labelBase = 'text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-lg shadow-indigo-100/50 dark:shadow-slate-900/50 p-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isMainUserUpdate
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-200/60'
                  : 'bg-gradient-to-br from-indigo-400 to-violet-500 shadow-indigo-200/60'
              }`}
            >
              <FiUser className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                {isMainUserUpdate ? 'Update Main User' : 'Update Company User'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Edit user details and manage role assignments
              </p>
              {userData.company_id && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                  <HiOutlineBuildingOffice className="w-3.5 h-3.5" />
                  Company: {userData.company_id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-xl shadow-indigo-100/30 dark:shadow-slate-900/30 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              User Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="flex flex-col">
                <label htmlFor="full_name" className={labelBase}>
                  Full name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-lg" />
                  <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    className={`${inputBase} pl-10`}
                    value={userData.full_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="email" className={labelBase}>
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-lg" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className={`${inputBase} pl-10`}
                    value={userData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="password" className={labelBase}>
                  New Password{' '}
                  <span className="text-xs text-slate-400">(leave blank to keep)</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-lg" />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className={`${inputBase} pl-10`}
                    value={userData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#605BFF] to-[#3a3799] shadow-[0_4px_23px_0_rgba(96,91,255,0.5)] hover:shadow-[0_6px_28px_0_rgba(96,91,255,0.6)] transition-all duration-200 flex items-center gap-2"
              >
                <FiSave className="text-lg" />
                Save Changes
              </button>
            </div>
          </div>
        </form>

        {/* Role Assignment Section */}
        {isAdminDashboard && id && (
          <div className="mt-6 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-xl shadow-indigo-100/30 dark:shadow-slate-900/30 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineShieldCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Role & Permission Management
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Assign or remove roles to control what this user can access. Each role includes a set of permissions.
              </p>

              {isMainUserUpdate ? (
                <UserRoleAssignment userId={+id} userType="main" />
              ) : userData.company_id ? (
                <UserRoleAssignment
                  userId={+id}
                  userType="company"
                  companyId={userData.company_id}
                />
              ) : (
                <p className="text-sm text-amber-600 italic">
                  Loading user company information...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateUser;

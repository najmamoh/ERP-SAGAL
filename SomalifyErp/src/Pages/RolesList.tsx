import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllRolesFn } from '@/Redux/Slice/RolesSlice';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function RolesList() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: roles, isLoading, isError, errorMsg } = useSelector((state: RootState) => state.roles);

  useEffect(() => {
    dispatch(getAllRolesFn());
  }, [dispatch]);

  useEffect(() => {
    if (isError) toast.error(errorMsg || 'Failed to load roles', { id: 'roles-error' });
  }, [isError, errorMsg]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                className="relative p-2.5 rounded bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
              >
                <HiOutlineShieldCheck className="text-white text-xl" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400">
                  Roles
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Manage system roles and their permissions
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role, idx) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                        {role.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {role.description || 'No description'}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        role.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {role.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                      Permissions ({role.permissions?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions?.slice(0, 5).map((rp) => (
                        <span
                          key={rp.id}
                          className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs"
                        >
                          {rp.permission?.name}
                        </span>
                      ))}
                      {role.permissions?.length > 5 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{role.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                  {(role._count?.user_roles || role._count?.main_user_roles) !== undefined && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Users: {(role._count?.user_roles || 0) + (role._count?.main_user_roles || 0)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default RolesList;

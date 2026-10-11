import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllPermissionsFn } from '@/Redux/Slice/PermissionsSlice';
import { motion } from 'framer-motion';
import { HiOutlineKey } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function PermissionsList() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: permissions, isLoading, isError, errorMsg } = useSelector((state: RootState) => state.permissions);

  useEffect(() => {
    dispatch(getAllPermissionsFn());
  }, [dispatch]);

  useEffect(() => {
    if (isError) toast.error(errorMsg || 'Failed to load permissions', { id: 'permissions-error' });
  }, [isError, errorMsg]);

  const groupedByResource = useMemo(() => {
    const map: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      const resource = p.resource || 'other';
      if (!map[resource]) map[resource] = [];
      map[resource].push(p);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

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
                <HiOutlineKey className="text-white text-xl" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400">
                  Permissions
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  System permissions grouped by resource
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {groupedByResource.map(([resource, perms], idx) => (
                <motion.div
                  key={resource}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-lg"
                >
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize mb-4">
                    {resource}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((p) => (
                      <span
                        key={p.id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-200 dark:border-indigo-800"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default PermissionsList;

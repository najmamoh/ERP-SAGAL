import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { AppDispatch, RootState } from '@/Redux/Store';
import {
  getAllRolesFn,
  createRoleFn,
  updateRoleFn,
  deleteRoleFn,
} from '@/Redux/Slice/RolesManagementSlice';
import { getAllPermissionsFn } from '@/Redux/Slice/PermissionsManagementSlice';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Url } from '@/Interfaces';
import {
  HiOutlineShieldCheck,
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronDown,
  HiChevronUp,
  HiLockClosed,
  HiKey,
  HiUsers,
  HiXMark,
  HiMagnifyingGlass,
} from 'react-icons/hi2';

interface RolePermission {
  id: number;
  permission: {
    id: number;
    name: string;
    resource: string;
    action: string;
    description?: string;
  };
}

interface Role {
  id: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  permissions?: RolePermission[];
  _count?: { user_roles: number; main_user_roles: number };
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

/* ─────────── Toggle Switch ─────────── */
function Toggle({
  enabled,
  onChange,
  loading,
}: {
  enabled: boolean;
  onChange: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-wait ${
        enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/* ─────────── Role Card ─────────── */
function RoleCard({
  role,
  allPermissions,
  onUpdate,
  onDelete,
  onRefresh,
}: {
  role: Role;
  allPermissions: Permission[];
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(role.name);
  const [editDesc, setEditDesc] = useState(role.description || '');

  const currentPermIds = useMemo(
    () => new Set(role.permissions?.map((rp) => rp.permission.id) || []),
    [role.permissions]
  );

  // Group permissions by resource
  const grouped = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    allPermissions.forEach((p) => {
      if (!map[p.resource]) map[p.resource] = [];
      map[p.resource].push(p);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  const handleTogglePermission = async (permId: number) => {
    setToggling(permId);
    try {
      const has = currentPermIds.has(permId);
      if (has) {
        await axios.delete(`${Url}/roles/${role.id}/permissions/${permId}`, {
          withCredentials: true,
        });
      } else {
        await axios.post(
          `${Url}/roles/${role.id}/permissions/${permId}`,
          {},
          { withCredentials: true }
        );
      }
      onRefresh();
    } catch {
      toast.error('Failed to update permission');
    } finally {
      setToggling(null);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast.error('Role name is required');
      return;
    }
    onUpdate(role.id, { name: editName.trim(), description: editDesc.trim() });
    setIsEditing(false);
  };

  const getRoleStyle = (name: string) => {
    if (name === 'super_admin' || name === 'superAdmin')
      return {
        gradient: 'from-red-500 to-rose-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        icon: <HiLockClosed className="w-5 h-5" />,
      };
    if (name === 'admin')
      return {
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        icon: <HiKey className="w-5 h-5" />,
      };
    return {
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      border: 'border-violet-200 dark:border-violet-800',
      badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      icon: <HiUsers className="w-5 h-5" />,
    };
  };

  const style = getRoleStyle(role.name);
  const totalUsers = (role._count?.user_roles || 0) + (role._count?.main_user_roles || 0);
  const permCount = role.permissions?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`rounded-2xl border ${style.border} ${style.bg} overflow-hidden transition-shadow hover:shadow-lg`}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-lg`}
            >
              {style.icon}
            </div>
            <div className="min-w-0">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    className="text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Role name"
                  />
                  <input
                    className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="text-xs px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {role.description || 'No description'}
                  </p>
                </>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setEditName(role.name);
                  setEditDesc(role.description || '');
                  setIsEditing(true);
                }}
                className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-500 hover:text-indigo-600 transition-colors"
                title="Edit role"
              >
                <HiPencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (totalUsers > 0) {
                    toast.error(`Cannot delete: ${totalUsers} user(s) assigned`);
                    return;
                  }
                  if (window.confirm('Delete this role?')) onDelete(role.id);
                }}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete role"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
            <HiUsers className="w-3.5 h-3.5" />
            {totalUsers} user{totalUsers !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <HiKey className="w-3.5 h-3.5" />
            {permCount} permission{permCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Expand / collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/60 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          {expanded ? (
            <>
              <HiChevronUp className="w-4 h-4" /> Hide permissions
            </>
          ) : (
            <>
              <HiChevronDown className="w-4 h-4" /> Manage permissions
            </>
          )}
        </button>
      </div>

      {/* Permissions panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200/80 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40 px-5 pb-5 pt-4">
              {grouped.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No permissions created yet.</p>
              ) : (
                <div className="space-y-5">
                  {grouped.map(([resource, perms]) => (
                    <div key={resource}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {resource}
                        </span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((perm) => {
                          const isOn = currentPermIds.has(perm.id);
                          return (
                            <div
                              key={perm.id}
                              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors ${
                                isOn
                                  ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-200/60 dark:border-indigo-800/60'
                                  : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200/60 dark:border-gray-700'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {perm.action}
                                </p>
                                {perm.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                              <Toggle
                                enabled={isOn}
                                loading={toggling === perm.id}
                                onChange={() => handleTogglePermission(perm.id)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────── Main Page ─────────── */
export default function RolesManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  const rolesState = useSelector((state: RootState) => state.rolesManagement);
  const permissionsState = useSelector((state: RootState) => state.permissionsManagement);

  useEffect(() => {
    dispatch(getAllRolesFn());
    dispatch(getAllPermissionsFn());
  }, [dispatch]);

  const roles = (Array.isArray(rolesState.data) ? rolesState.data : []) as Role[];
  const allPermissions: Permission[] = Array.isArray(permissionsState.data)
    ? permissionsState.data
    : [];

  const filteredRoles = useMemo(
    () =>
      roles.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.description || '').toLowerCase().includes(search.toLowerCase())
      ),
    [roles, search]
  );

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    dispatch(createRoleFn({ name: formData.name.trim(), description: formData.description.trim() }))
      .unwrap()
      .then(() => {
        toast.success('Role created');
        setFormData({ name: '', description: '' });
        setShowCreate(false);
        dispatch(getAllRolesFn());
      })
      .catch(() => toast.error('Failed to create role'));
  };

  const handleUpdate = (id: number, data: any) => {
    dispatch(updateRoleFn({ id, ...data }))
      .unwrap()
      .then(() => {
        toast.success('Role updated');
        dispatch(getAllRolesFn());
      })
      .catch(() => toast.error('Failed to update role'));
  };

  const handleDelete = (id: number) => {
    dispatch(deleteRoleFn(id))
      .unwrap()
      .then(() => {
        toast.success('Role deleted');
        dispatch(getAllRolesFn());
      })
      .catch(() => toast.error('Failed to delete role'));
  };

  const refresh = () => {
    dispatch(getAllRolesFn());
    dispatch(getAllPermissionsFn());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 px-6 py-7 mb-8 shadow-xl shadow-indigo-500/20"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <HiOutlineShieldCheck className="text-3xl text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
              <p className="text-sm text-indigo-100 mt-1">
                Create roles, then toggle permissions on or off for each role.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 shadow-lg transition-all active:scale-95"
            >
              <HiPlus className="w-5 h-5" />
              New Role
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Roles', value: roles.length, color: 'text-indigo-600' },
            { label: 'Total Permissions', value: allPermissions.length, color: 'text-violet-600' },
            {
              label: 'Resources',
              value: new Set(allPermissions.map((p) => p.resource)).size,
              color: 'text-blue-600',
            },
            {
              label: 'Active Roles',
              value: roles.filter((r) => r.is_active).length,
              color: 'text-green-600',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {rolesState.isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Roles grid */}
        {!rolesState.isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AnimatePresence>
              {filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  allPermissions={allPermissions}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onRefresh={refresh}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!rolesState.isLoading && filteredRoles.length === 0 && (
          <div className="text-center py-16">
            <HiOutlineShieldCheck className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              {search ? 'No roles match your search' : 'No roles created yet'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {search ? 'Try a different search term.' : 'Click "New Role" to create your first role.'}
            </p>
          </div>
        )}

        {/* Create Role Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Role</h2>
                    <button
                      onClick={() => setShowCreate(false)}
                      className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700 text-gray-500"
                    >
                      <HiXMark className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Create a role, then assign permissions via toggles.
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Role Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. manager, cashier, viewer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What can this role do?"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={rolesState.isLoading}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Create Role
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

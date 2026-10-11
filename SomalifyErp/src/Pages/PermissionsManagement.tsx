import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  getAllPermissionsFn,
  createPermissionFn,
  updatePermissionFn,
  deletePermissionFn,
} from '@/Redux/Slice/PermissionsManagementSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineKey,
  HiPlus,
  HiPencil,
  HiTrash,
  HiXMark,
  HiMagnifyingGlass,
  HiShieldCheck,
  HiCube,
  HiBolt,
} from 'react-icons/hi2';

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
  roles?: Array<{ role: { id: number; name: string } }>;
}

interface FormData {
  name: string;
  resource: string;
  action: string;
  description: string;
}

const emptyForm: FormData = { name: '', resource: '', action: '', description: '' };

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  read: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  update: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  export: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  manage: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  transfer: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
};

const getActionColor = (action: string) =>
  ACTION_COLORS[action.toLowerCase()] ||
  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

/* ─────────── Permission Card ─────────── */
function PermissionCard({
  perm,
  onEdit,
  onDelete,
}: {
  perm: Permission;
  onEdit: (p: Permission) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getActionColor(
                perm.action
              )}`}
            >
              {perm.action}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {perm.name}
          </p>
          {perm.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {perm.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(perm)}
            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this permission?')) onDelete(perm.id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── Resource Group ─────────── */
function ResourceGroup({
  resource,
  permissions,
  onEdit,
  onDelete,
}: {
  resource: string;
  permissions: Permission[];
  onEdit: (p: Permission) => void;
  onDelete: (id: number) => void;
}) {
  const RESOURCE_ICONS: Record<string, JSX.Element> = {
    products: <HiCube className="w-4 h-4" />,
    sales: <HiBolt className="w-4 h-4" />,
    roles: <HiShieldCheck className="w-4 h-4" />,
    permissions: <HiOutlineKey className="w-4 h-4" />,
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
          {RESOURCE_ICONS[resource.toLowerCase()] || (
            <span className="text-xs font-bold uppercase">
              {resource.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white capitalize">
            {resource}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {permissions.map((perm) => (
          <PermissionCard key={perm.id} perm={perm} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export default function PermissionsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const permissionsState = useSelector((state: RootState) => state.permissionsManagement);
  const [showModal, setShowModal] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllPermissionsFn());
  }, [dispatch]);

  const permissions: Permission[] = Array.isArray(permissionsState.data)
    ? permissionsState.data
    : [];

  // Filter & group by resource
  const grouped = useMemo(() => {
    const filtered = permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.resource.toLowerCase().includes(search.toLowerCase()) ||
        p.action.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
    );
    const map: Record<string, Permission[]> = {};
    filtered.forEach((p) => {
      if (!map[p.resource]) map[p.resource] = [];
      map[p.resource].push(p);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions, search]);

  const openCreate = () => {
    setEditingPerm(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (perm: Permission) => {
    setEditingPerm(perm);
    setFormData({
      name: perm.name,
      resource: perm.resource,
      action: perm.action,
      description: perm.description || '',
    });
    setShowModal(true);
  };

  const handleResourceActionChange = (field: 'resource' | 'action', value: string) => {
    const next = { ...formData, [field]: value };
    if (next.resource && next.action) {
      next.name = `${next.resource}:${next.action}`;
    }
    setFormData(next);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.resource.trim() || !formData.action.trim()) {
      toast.error('Resource, action, and name are required');
      return;
    }
    if (editingPerm) {
      dispatch(
        updatePermissionFn({
          id: editingPerm.id,
          name: formData.name.trim(),
          resource: formData.resource.trim(),
          action: formData.action.trim(),
          description: formData.description.trim(),
        })
      )
        .unwrap()
        .then(() => {
          toast.success('Permission updated');
          setShowModal(false);
          dispatch(getAllPermissionsFn());
        })
        .catch(() => toast.error('Failed to update'));
    } else {
      dispatch(
        createPermissionFn({
          name: formData.name.trim(),
          resource: formData.resource.trim(),
          action: formData.action.trim(),
          description: formData.description.trim(),
        })
      )
        .unwrap()
        .then(() => {
          toast.success('Permission created');
          setFormData(emptyForm);
          setShowModal(false);
          dispatch(getAllPermissionsFn());
        })
        .catch(() => toast.error('Failed to create'));
    }
  };

  const handleDelete = (id: number) => {
    dispatch(deletePermissionFn(id))
      .unwrap()
      .then(() => {
        toast.success('Permission deleted');
        dispatch(getAllPermissionsFn());
      })
      .catch(() => toast.error('Failed to delete'));
  };

  const quickActions = [
    'create',
    'read',
    'update',
    'delete',
    'export',
    'manage',
    'transfer',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-7 mb-8 shadow-xl shadow-blue-500/20"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <HiOutlineKey className="text-3xl text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">Permissions</h1>
              <p className="text-sm text-blue-100 mt-1">
                Define what actions can be performed on each resource. Assign them to roles.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 shadow-lg transition-all active:scale-95"
            >
              <HiPlus className="w-5 h-5" />
              New Permission
            </button>
          </div>
        </motion.div>

        {/* Quick info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: permissions.length, color: 'text-indigo-600' },
            {
              label: 'Resources',
              value: new Set(permissions.map((p) => p.resource)).size,
              color: 'text-blue-600',
            },
            {
              label: 'Actions',
              value: new Set(permissions.map((p) => p.action)).size,
              color: 'text-violet-600',
            },
            { label: 'Groups', value: grouped.length, color: 'text-purple-600' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search permissions by name, resource, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
          />
        </div>

        {/* Loading */}
        {permissionsState.isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Grouped permissions */}
        {!permissionsState.isLoading && (
          <div className="space-y-8">
            {grouped.map(([resource, perms]) => (
              <ResourceGroup
                key={resource}
                resource={resource}
                permissions={perms}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {!permissionsState.isLoading && grouped.length === 0 && (
          <div className="text-center py-16">
            <HiOutlineKey className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              {search ? 'No permissions match your search' : 'No permissions yet'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {search
                ? 'Try a different search term.'
                : 'Click "New Permission" to create permissions for your system.'}
            </p>
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingPerm ? 'Edit Permission' : 'Create Permission'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700 text-gray-500"
                    >
                      <HiXMark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Resource
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.resource}
                      onChange={(e) => handleResourceActionChange('resource', e.target.value)}
                      placeholder="e.g. products, sales, warehouse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Action
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.action}
                      onChange={(e) => handleResourceActionChange('action', e.target.value)}
                      placeholder="e.g. create, read, update, delete"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {quickActions.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => handleResourceActionChange('action', a)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            formData.action === a
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Name{' '}
                      <span className="text-xs text-gray-400 font-normal">(auto-generated)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      placeholder="What does this permission allow?"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={permissionsState.isLoading}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {editingPerm ? 'Save Changes' : 'Create Permission'}
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

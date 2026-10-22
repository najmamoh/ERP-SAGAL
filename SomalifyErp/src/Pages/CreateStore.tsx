import { FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppDispatch, RootState } from '@/Redux/Store';
import { createStoreFn, resetCreateStore } from '@/Redux/Slice/CreateStoreSlice';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { HiOutlineBuildingStorefront, HiOutlineMapPin, HiOutlineDocumentText } from 'react-icons/hi2';

const inputClass =
  'w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 outline-none transition-all shadow-sm';

export default function CreateStore() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [store_name, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [company_ids, setCompanyIds] = useState<string[]>([]);

  const CreateStoreState = useSelector((state: RootState) => state.CreateStore);
  const AllCompanies = useSelector((state: RootState) => state.AllCompanies);

  useEffect(() => {
    dispatch(getAllCompaniesFn());
  }, [dispatch]);

  useEffect(() => {
    if (CreateStoreState.isLoading) toast.loading('Creating store...', { id: 'create-store' });
    if (CreateStoreState.isSuccess) {
      toast.success('Store created.', { id: 'create-store' });
      dispatch(resetCreateStore());
      navigate('/AdminDashboard/Stores');
    }
    if (CreateStoreState.isError) {
      toast.error(CreateStoreState.errorMsg, { id: 'create-store' });
      dispatch(resetCreateStore());
    }
  }, [CreateStoreState.isLoading, CreateStoreState.isSuccess, CreateStoreState.isError, CreateStoreState.errorMsg, dispatch, navigate]);

  const companies = Array.isArray(AllCompanies.data) ? AllCompanies.data : [];

  const toggleCompany = (company_id: string) => {
    setCompanyIds((prev) =>
      prev.includes(company_id) ? prev.filter((id) => id !== company_id) : [...prev, company_id]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!store_name.trim()) {
      toast.error('Store name is required');
      return;
    }
    dispatch(
      createStoreFn({
        store_name: store_name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        company_ids: company_ids.length ? company_ids : undefined,
      })
    );
  };

  return (
    <div className="soft-page">
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
            <HiOutlineBuildingStorefront className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Create Store
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
              Add a store and link companies. Toggle <strong className="text-green-600 dark:text-green-400">On</strong> to allow a company to sell, <strong className="text-gray-500">Off</strong> to exclude.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Store name *</label>
              <div className="relative">
                <HiOutlineBuildingStorefront className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
                <input
                  value={store_name}
                  onChange={(e) => setStoreName(e.target.value)}
                  type="text"
                  placeholder="e.g. Main Mall Store"
                  className={`${inputClass} pl-12`}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <div className="relative">
                <HiOutlineDocumentText className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the store"
                  rows={3}
                  className={`${inputClass} resize-none pl-12 pt-3`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
              <div className="relative">
                <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  type="text"
                  placeholder="e.g. Downtown, Building A"
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Companies — Allow / Off</label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Toggle <span className="font-medium text-green-600 dark:text-green-400">On</span> to allow a company to sell on this store, <span className="font-medium text-gray-500">Off</span> to exclude.
              </p>
              <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/30 p-3 max-h-56 overflow-y-auto space-y-2">
                {AllCompanies.isLoading ? (
                  <p className="text-sm text-gray-500 py-4 text-center">Loading companies...</p>
                ) : companies.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No companies found.</p>
                ) : (
                  companies.map((c: { company_id: string; company_name: string }) => (
                    <div
                      key={c.company_id}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{c.company_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 min-w-[32px] text-right">
                          {company_ids.includes(c.company_id) ? 'Allow' : 'Off'}
                        </span>
                        <Switch
                          checked={company_ids.includes(c.company_id)}
                          onCheckedChange={() => toggleCompany(c.company_id)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/AdminDashboard/Stores')}
                className="px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={CreateStoreState.isLoading || !store_name.trim()}
                className="soft-submit"
              >
                {CreateStoreState.isLoading ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

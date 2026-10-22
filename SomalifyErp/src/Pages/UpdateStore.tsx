import { FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getOneStoreFn, resetOneStore } from '@/Redux/Slice/GetOneStoreSlice';
import { updateStoreFn, resetUpdateStore } from '@/Redux/Slice/UpdateStoreSlice';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';

const inputClass =
  'w-full rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all';

export default function UpdateStore() {
  const { store_id } = useParams<{ store_id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [store_name, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [company_ids, setCompanyIds] = useState<string[]>([]);

  const OneStore = useSelector((state: RootState) => state.OneStore);
  const UpdateStoreState = useSelector((state: RootState) => state.UpdateStore);
  const AllCompanies = useSelector((state: RootState) => state.AllCompanies);

  const store = OneStore.data;
  const companies = Array.isArray(AllCompanies.data) ? AllCompanies.data : [];

  useEffect(() => {
    if (store_id) {
      dispatch(getOneStoreFn(store_id));
      dispatch(getAllCompaniesFn());
    }
    return () => {
      dispatch(resetOneStore());
      dispatch(resetUpdateStore());
    };
  }, [store_id, dispatch]);

  useEffect(() => {
    if (store) {
      setStoreName(store.store_name ?? '');
      setDescription(store.description ?? '');
      setLocation(store.location ?? '');
      const ids =
        store.store_companies?.map((sc: { company: { company_id: string } }) => sc.company.company_id) ?? [];
      setCompanyIds(ids);
    }
  }, [store]);

  useEffect(() => {
    if (UpdateStoreState.isLoading) toast.loading('Updating store...', { id: 'update-store' });
    if (UpdateStoreState.isSuccess) {
      toast.success('Store updated.', { id: 'update-store' });
      dispatch(resetUpdateStore());
      navigate('/AdminDashboard/Stores');
    }
    if (UpdateStoreState.isError) {
      toast.error(UpdateStoreState.errorMsg, { id: 'update-store' });
      dispatch(resetUpdateStore());
    }
  }, [UpdateStoreState.isLoading, UpdateStoreState.isSuccess, UpdateStoreState.isError, UpdateStoreState.errorMsg, dispatch, navigate]);

  const toggleCompany = (company_id: string) => {
    setCompanyIds((prev) =>
      prev.includes(company_id) ? prev.filter((id) => id !== company_id) : [...prev, company_id]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!store_id) return;
    if (!store_name.trim()) {
      toast.error('Store name is required');
      return;
    }
    dispatch(
      updateStoreFn({
        store_id,
        store_name: store_name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        company_ids,
      })
    );
  };

  if (!store_id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Invalid store. <button className="ml-2 text-blue-600 underline" onClick={() => navigate('/AdminDashboard/Stores')}>Back to Stores</button>
      </div>
    );
  }

  if (OneStore.isError && !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
        <p>{OneStore.errorMsg}</p>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate('/AdminDashboard/Stores')}>Back to Stores</button>
      </div>
    );
  }

  return (
    <div className="soft-page">
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
            <HiOutlineBuildingStorefront className="text-indigo-600 dark:text-indigo-400 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Update Store
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
              Edit store details and choose which companies can sell here. Toggle <strong className="text-green-600 dark:text-green-400">On</strong> to allow, <strong className="text-gray-500">Off</strong> to exclude.
            </p>
          </div>
        </motion.div>

        {OneStore.isLoading && !store ? (
          <div className="py-12 text-center text-gray-500">Loading store...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Store name *</label>
                <input
                  value={store_name}
                  onChange={(e) => setStoreName(e.target.value)}
                  type="text"
                  placeholder="e.g. Main Mall Store"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  type="text"
                  placeholder="e.g. Downtown, Building A"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Companies (allow / off)</label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Toggle <span className="font-medium text-green-600 dark:text-green-400">On</span> to allow a company to sell on this store, <span className="font-medium text-gray-500">Off</span> to exclude. You can add or remove companies here.
                </p>
                <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/30 p-3 max-h-56 overflow-y-auto space-y-2">
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
                          <span className="text-xs text-gray-500">
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
                  className="px-5 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={UpdateStoreState.isLoading || !store_name.trim()}
                  className="soft-submit"
                >
                  {UpdateStoreState.isLoading ? 'Updating...' : 'Update Store'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

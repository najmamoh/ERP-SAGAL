import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { GoPlus } from 'react-icons/go';
import axios from 'axios';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllStoresFn, resetAllStores, StoreData } from '@/Redux/Slice/GetAllStoresSlice';
import { getAllProductsFn } from '@/Redux/Slice/getAllProductsSlice';
import { Url } from '@/Interfaces';
import { isFullAccessRole } from '@/lib/permissions';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type StockRow = {
  productName: string;
  productCode: string;
  quantity: number;
  price: string;
};

function currentUserIsAdmin(): boolean {
  try {
    const raw = localStorage.getItem('userInfo');
    const parsed = raw ? JSON.parse(raw) : {};
    const roles: string[] = parsed?.user?.roles ?? parsed?.roles ?? [];
    return isFullAccessRole(roles);
  } catch {
    return false;
  }
}

export default function Stores() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: stores, isLoading, isError, errorMsg } = useSelector((state: RootState) => state.AllStores);
  const [stockStore, setStockStore] = useState<StoreData | null>(null);
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');
  const [addStore, setAddStore] = useState<StoreData | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const canAddProducts = currentUserIsAdmin();
  const products = useSelector((state: RootState) => state.AllProduct);

  useEffect(() => {
    dispatch(getAllStoresFn());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(errorMsg, { id: 'stores-error' });
      dispatch(resetAllStores());
    }
  }, [isError, errorMsg, dispatch]);

  const list = Array.isArray(stores) ? stores : (stores && typeof stores === 'object' && 'length' in stores ? (stores as unknown[]) : []);

  const handleRefresh = () => {
    dispatch(getAllStoresFn());
  };

  const closeCurrentStock = () => {
    setStockStore(null);
    setStockRows([]);
    setStockError('');
    setStockLoading(false);
  };

  const openCurrentStock = async (store: StoreData) => {
    setStockStore(store);
    setStockRows([]);
    setStockError('');
    setStockLoading(true);
    try {
      const res = await axios.get(`${Url}/stores/${store.store_id}/stock`, {
        withCredentials: true,
      });
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setStockRows(items.map((item: {
        quantity?: number | string;
        product?: { product_name?: string; product_code?: string; product_price?: string | number };
      }): StockRow => ({
        productName: item.product?.product_name || 'Unknown product',
        productCode: item.product?.product_code || '-',
        quantity: Number(item.quantity ?? 0),
        price: item.product?.product_price != null ? String(item.product.product_price) : '',
      })));
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not load current stock.'
        : 'Could not load current stock.';
      setStockError(String(message));
    } finally {
      setStockLoading(false);
    }
  };

  const openAddProducts = (store: StoreData) => {
    setAddStore(store);
    setProductSearch('');
    setSelectedProductId('');
    setAddQuantity('');
    dispatch(getAllProductsFn({ page: 1, pageSize: 50, search: '' }));
  };

  const closeAddProducts = () => {
    setAddStore(null);
    setAddSaving(false);
  };

  useEffect(() => {
    if (!addStore) return;
    const timer = setTimeout(() => {
      dispatch(getAllProductsFn({ page: 1, pageSize: 50, search: productSearch }));
    }, 300);
    return () => clearTimeout(timer);
  }, [addStore, productSearch, dispatch]);

  const submitAddProduct = async () => {
    if (!addStore) return;
    const qty = Number(String(addQuantity).replace(',', '.'));
    if (!selectedProductId || !Number.isFinite(qty) || qty <= 0) {
      toast.error('Select a product and enter a quantity greater than 0.');
      return;
    }
    setAddSaving(true);
    try {
      await axios.post(
        `${Url}/stores/${addStore.store_id}/stock`,
        { product_id: Number(selectedProductId), quantity: qty },
        { withCredentials: true }
      );
      toast.success('Product added to this store.');
      const store = addStore;
      closeAddProducts();
      openCurrentStock(store);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not add the product.'
        : 'Could not add the product.';
      toast.error(String(message));
      setAddSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative p-2.5 rounded bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
              >
                <HiOutlineShoppingBag className="text-white text-xl" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400">
                  Stores
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Stores linked to companies for selling purchases
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/AdminDashboard/Stores/Create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm shadow-xl hover:shadow-2xl transition-all"
            >
              <GoPlus className="text-lg" />
              Create Store
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Stores</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stores and their linked companies</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            {isError ? (
              <div className="py-12 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">{errorMsg}</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : isLoading ? (
              <div className="py-12 text-center text-gray-500">Loading stores...</div>
            ) : list.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No stores yet. Create a store and link companies to it.
              </div>
            ) : (
              <div className="space-y-4">
                {(list as StoreData[]).map((store) => (
                  <motion.div
                    key={store.store_id}
                    layout
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{store.store_name}</h3>
                        {store.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{store.description}</p>
                        )}
                        {store.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">📍 {store.location}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Created {format(new Date(store.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Linked companies: {store.store_companies?.length ?? 0}
                        </span>
                        {store.store_companies && store.store_companies.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end">
                            {store.store_companies.slice(0, 5).map((sc: { company: { company_name: string } }) => (
                              <span
                                key={sc.company.company_name}
                                className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                              >
                                {sc.company.company_name}
                              </span>
                            ))}
                            {store.store_companies.length > 5 && (
                              <span className="text-xs text-gray-500">+{store.store_companies.length - 5} more</span>
                            )}
                          </div>
                        )}
                        {canAddProducts && (
                          <button
                            type="button"
                            onClick={() => openAddProducts(store)}
                            className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          >
                            Add products
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openCurrentStock(store)}
                          className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          Current Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/AdminDashboard/Stores/Update/${store.store_id}`)}
                          className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {stockStore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCurrentStock}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current Stock</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stockStore.store_name}</p>
              </div>
              <button
                type="button"
                onClick={closeCurrentStock}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-auto max-h-[65vh]">
              {stockLoading ? (
                <p className="py-8 text-center text-gray-500">Loading current stock...</p>
              ) : stockError ? (
                <p className="py-8 text-center text-red-600 dark:text-red-400">{stockError}</p>
              ) : stockRows.length === 0 ? (
                <p className="py-8 text-center text-gray-500">No products in stock for this store.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <th className="py-2 pr-3">Product</th>
                      <th className="py-2 pr-3">Code</th>
                      <th className="py-2 pr-3 text-right">Quantity</th>
                      <th className="py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockRows.map((row, index) => (
                      <tr key={`${row.productCode}-${index}`} className="border-b border-gray-100 dark:border-gray-700/60">
                        <td className="py-2.5 pr-3 font-medium text-gray-900 dark:text-white">{row.productName}</td>
                        <td className="py-2.5 pr-3 text-gray-600 dark:text-gray-300">{row.productCode}</td>
                        <td className="py-2.5 pr-3 text-right font-semibold text-gray-900 dark:text-white">{row.quantity}</td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-gray-200">
                          {row.price ? Number(row.price).toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {addStore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeAddProducts}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {addStore.store_name}. Only admin can add existing products.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddProducts}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <input
                type="text"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search existing products..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a product</option>
                {(products.data || []).map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name} ({product.product_code})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.01"
                step="any"
                value={addQuantity}
                onChange={(event) => setAddQuantity(event.target.value)}
                placeholder="Quantity"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                disabled={addSaving}
                onClick={submitAddProduct}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {addSaving ? 'Saving...' : 'Add to store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

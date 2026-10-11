import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/Redux/Store';
import {
  getStoreByCompanyFn,
  getTransfersToCompanyFn,
  approveTransferFn,
  completeTransferFn,
  cancelTransferFn,
} from '@/Redux/Slice/WarehouseSlice';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
import { getLinkedStoresByCompanyFn } from '@/Redux/Slice/LinkedStoresSlice';
import {
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingCart,
  FiArrowRight,
  FiX,
  FiPackage,
  FiChevronDown,
  FiMapPin,
} from 'react-icons/fi';
import { MdOutlineInventory2, MdInfoOutline } from 'react-icons/md';
import { HiOutlineCube, HiOutlineBuildingStorefront } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function CompanyStore() {
  const dispatch = useDispatch<AppDispatch>();
  const companyState = useSelector((state: RootState) => state.GetOneCompanay);
  const warehouseState = useSelector((state: RootState) => state.warehouse);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const companyId =
    companyState?.data?.company_id ||
    userInfo?.user?.company_id ||
    userInfo?.company_id;

  const store = warehouseState?.companyStore ?? null;
  const transfersToCompany = warehouseState?.transfersToCompany ?? [];
  const pendingTransfers = transfersToCompany.filter(
    (t: any) => t.status === 'PENDING'
  );
  const receivedStockRaw = store?.stock ?? [];
  const receivedStock = receivedStockRaw.filter((s: any) => (s.quantity ?? 0) > 0);
  const categories: string[] = (store as any)?.categories ?? [];
  const totalItems: number = (store as any)?.totalItems ?? receivedStock.length;
  const totalPages: number = (store as any)?.totalPages ?? 1;
  const currentPage: number = (store as any)?.currentPage ?? 1;

  const linkedStoresState = useSelector((state: RootState) => state.linkedStores);
  const linkedStores = linkedStoresState.stores ?? [];
  const linkedStoresProductsRaw = linkedStoresState.products ?? [];
  const linkedStoresProducts = linkedStoresProductsRaw.filter((p: any) => (p.quantity ?? 0) > 0);

  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showPendingSection, setShowPendingSection] = useState(true);
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [storeSearch, setStoreSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PAGE_SIZE = 20;

  // Fetch company info on mount
  useEffect(() => {
    dispatch(getOneCompanayFN());
  }, [dispatch]);

  // Fetch transfers and linked stores
  useEffect(() => {
    if (companyId) {
      dispatch(getTransfersToCompanyFn({ companyId }));
      dispatch(getLinkedStoresByCompanyFn(companyId));
    }
  }, [companyId, dispatch]);

  // Fetch store stock with search/category/page
  const fetchStock = useCallback(() => {
    if (!companyId) return;
    dispatch(
      getStoreByCompanyFn({
        companyId,
        search: debouncedSearch,
        category: selectedCategory,
        page,
        pageSize: PAGE_SIZE,
      })
    );
  }, [companyId, debouncedSearch, selectedCategory, page, dispatch]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset page on new search
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const handleApproveAndReceive = async (transferId: number) => {
    setLoadingAction(transferId);
    try {
      await dispatch(approveTransferFn(transferId)).unwrap();
      await dispatch(completeTransferFn(transferId)).unwrap();
      toast.success('Items received in store');
      if (companyId) {
        fetchStock();
        dispatch(getTransfersToCompanyFn({ companyId }));
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to receive');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDecline = async (transferId: number) => {
    setLoadingAction(transferId);
    try {
      await dispatch(cancelTransferFn(transferId)).unwrap();
      toast.success('Transfer declined — items returned to HQ');
      if (companyId) {
        dispatch(getTransfersToCompanyFn({ companyId }));
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to decline');
    } finally {
      setLoadingAction(null);
    }
  };

  if (!companyId) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Company not found. You must be logged in as a company user.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 md:px-6 lg:px-8 py-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* ───── Header ───── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30">
              <MdOutlineInventory2 className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                Company Store
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                All items in your store — search, filter, and manage inventory
              </p>
            </div>
          </div>
          <Link
            to="/Dashboard/Sales/Create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200/50 dark:shadow-green-900/30 transition-all shrink-0"
          >
            <FiShoppingCart className="text-lg" />
            Go to Sales
          </Link>
        </div>
      </motion.div>

      {/* ───── Stat Cards ───── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Items"
          value={totalItems}
          icon={<HiOutlineCube className="text-blue-600 dark:text-blue-400" />}
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          label="Categories"
          value={categories.length}
          icon={<FiFilter className="text-indigo-600 dark:text-indigo-400" />}
          bg="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard
          label="Pending Transfers"
          value={pendingTransfers.length}
          icon={<FiClock className="text-amber-600 dark:text-amber-400" />}
          bg="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          label="Products"
          value={new Set(receivedStock.map((s: any) => s.product_id)).size}
          icon={<FiPackage className="text-green-600 dark:text-green-400" />}
          bg="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      {/* ───── Linked Stores (expandable with items table) ───── */}
      {(linkedStores.length > 0 || linkedStoresState.isLoading) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-indigo-200/60 dark:border-indigo-800/40 shadow-md overflow-hidden"
        >
          <div className="p-4 border-b border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/60 dark:bg-indigo-900/15">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HiOutlineBuildingStorefront className="text-indigo-600 dark:text-indigo-400" />
              Linked Stores ({linkedStores.length})
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Click a store to view all items inside it
            </p>
          </div>

          {linkedStoresState.isLoading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading linked stores...
            </div>
          ) : linkedStores.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No linked stores yet. Ask admin to link your company to stores.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {linkedStores.map(
                (s: {
                  store_id: string;
                  store_name: string;
                  description: string | null;
                  location: string | null;
                }) => {
                  const isExpanded = expandedStoreId === s.store_id;
                  const thisStoreProducts = (
                    (s as { products?: typeof linkedStoresProducts }).products ?? linkedStoresProducts
                  ).filter((p: any) => (p.quantity ?? 0) > 0);
                  // Filter products by store search
                  const filteredProducts = storeSearch
                    ? thisStoreProducts.filter(
                        (p: any) =>
                          (p.product?.product_name || '')
                            .toLowerCase()
                            .includes(storeSearch.toLowerCase()) ||
                          (p.product?.product_code || '')
                            .toLowerCase()
                            .includes(storeSearch.toLowerCase())
                      )
                    : thisStoreProducts;

                  return (
                    <div key={s.store_id}>
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedStoreId(isExpanded ? null : s.store_id);
                          setStoreSearch('');
                        }}
                        className="w-full flex items-center gap-3 p-4 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors text-left"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isExpanded
                              ? 'bg-indigo-600 dark:bg-indigo-500'
                              : 'bg-indigo-100 dark:bg-indigo-900/30'
                          }`}
                        >
                          <HiOutlineBuildingStorefront
                            className={`${
                              isExpanded
                                ? 'text-white'
                                : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {s.store_name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {s.location && (
                              <span className="flex items-center gap-1">
                                <FiMapPin className="text-[10px]" />
                                {s.location}
                              </span>
                            )}
                            {s.description && <span>{s.description}</span>}
                            <span>{thisStoreProducts.length} item(s)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
                            {thisStoreProducts.length} items
                          </span>
                          <FiChevronDown
                            className={`text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Expanded: items table */}
                      {isExpanded && (
                        <div className="border-t border-indigo-100 dark:border-indigo-900/30 bg-gray-50/50 dark:bg-gray-800/30">
                          {/* Search within store */}
                          <div className="p-3 border-b border-gray-100 dark:border-gray-700/40">
                            <div className="relative max-w-sm">
                              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                value={storeSearch}
                                onChange={(e) => setStoreSearch(e.target.value)}
                                placeholder="Search items in this store..."
                                className="w-full pl-9 pr-8 py-2 rounded-lg bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                              />
                              {storeSearch && (
                                <button
                                  type="button"
                                  onClick={() => setStoreSearch('')}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <FiX />
                                </button>
                              )}
                            </div>
                          </div>

                          {filteredProducts.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                              {storeSearch ? (
                                <>
                                  No items match "<strong>{storeSearch}</strong>".{' '}
                                  <button
                                    type="button"
                                    onClick={() => setStoreSearch('')}
                                    className="text-indigo-600 underline"
                                  >
                                    Clear search
                                  </button>
                                </>
                              ) : (
                                'No items in this store yet. Accept transfers to add stock.'
                              )}
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-gray-800/40">
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Product
                                    </th>
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                      Code
                                    </th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Quantity
                                    </th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Qty Sold
                                    </th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Price
                                    </th>
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Source
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredProducts.map((p: any, idx: number) => (
                                    <tr
                                      key={p.product_id ?? idx}
                                      className={`border-b border-gray-100 dark:border-gray-700/30 ${
                                        idx % 2 === 0
                                          ? ''
                                          : 'bg-white/40 dark:bg-gray-800/20'
                                      }`}
                                    >
                                      <td className="py-2.5 px-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                            <HiOutlineCube className="text-indigo-500 text-xs" />
                                          </div>
                                          <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                            {p.product?.product_name ?? '-'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-4 hidden sm:table-cell">
                                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
                                          {p.product?.product_code ?? '-'}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4 text-right">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                          {p.quantity}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4 text-right">
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                          {p.qty_sold ?? 0}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4 text-right">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          $
                                          {Number(
                                            p.product?.product_price ?? 0
                                          ).toFixed(2)}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4">
                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                          Already in store
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Summary footer */}
                          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-800/40 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {filteredProducts.length} item
                              {filteredProducts.length !== 1 ? 's' : ''}
                              {storeSearch && ` matching "${storeSearch}"`}
                            </span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Total qty:{' '}
                              {filteredProducts.reduce(
                                (sum: number, p: any) => sum + (p.quantity || 0),
                                0
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ───── Pending Transfers Banner ───── */}
      {pendingTransfers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-amber-200 dark:border-amber-800/50 shadow-md overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setShowPendingSection(!showPendingSection)}
            className="w-full flex items-center justify-between p-4 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-900/20 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
          >
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiClock className="text-amber-600" />
              Pending Transfers ({pendingTransfers.length})
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                — accept to add to store, or send back to HQ
              </span>
            </h2>
            <span className="text-sm text-gray-500">
              {showPendingSection ? 'Hide' : 'Show'}
            </span>
          </button>
          {showPendingSection && (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {pendingTransfers.map((t: any) => (
                <div
                  key={t.transfer_id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <FiPackage className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {t.product?.product_name ?? 'Product'}
                        {t.product?.product_code && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({t.product.product_code})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: <span className="font-medium">{t.quantity}</span> · From:{' '}
                        {t.warehouse?.warehouse_name ?? 'HQ'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={loadingAction === t.transfer_id}
                      onClick={() => handleApproveAndReceive(t.transfer_id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loadingAction === t.transfer_id ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FiCheckCircle />
                      )}
                      Accept & Receive
                    </button>
                    <button
                      disabled={loadingAction === t.transfer_id}
                      onClick={() => handleDecline(t.transfer_id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                      title="Return items to HQ warehouse"
                    >
                      <FiXCircle />
                      Send Back
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ───── Main Items Table ───── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
      >
        {/* Table header with search & filter */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HiOutlineCube className="text-blue-600 dark:text-blue-400" />
                Store Inventory
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in your store
                {debouncedSearch && (
                  <span className="text-blue-600 dark:text-blue-400 ml-1">
                    — searching "{debouncedSearch}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="text-indigo-600 dark:text-indigo-400 ml-1">
                    — category: {selectedCategory}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Search + filter row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name or code..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 transition-all text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="text-lg" />
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 transition-all appearance-none cursor-pointer text-sm min-w-[160px]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters */}
            {(debouncedSearch || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setDebouncedSearch('');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/50 transition-colors"
              >
                <FiX className="text-base" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {warehouseState?.isLoading && !store ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Loading store inventory...</p>
          </div>
        ) : receivedStock.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
              <HiOutlineCube className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {debouncedSearch || selectedCategory
                ? 'No items match your filters'
                : 'No items in store yet'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {debouncedSearch || selectedCategory ? (
                <>
                  Try a different search term or category.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('');
                      setDebouncedSearch('');
                    }}
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    Clear all filters
                  </button>
                </>
              ) : (
                'Accept incoming transfers above to add stock to your store.'
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Qty Sold
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receivedStock.map((s: any, idx: number) => {
                    const isLowStock =
                      s.product?.product_alert_number != null &&
                      s.quantity <= s.product.product_alert_number;
                    return (
                      <tr
                        key={s.stock_id}
                        className={`border-b border-gray-100 dark:border-gray-700/40 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors ${
                          idx % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-gray-800/20'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                              <HiOutlineCube className="text-blue-600 dark:text-blue-400 text-sm" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {s.product?.product_name ?? '-'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                                {s.product?.product_code ?? '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">
                            {s.product?.product_code ?? '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {s.product?.category ? (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50">
                              {s.product.category}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-semibold text-sm ${
                              isLowStock
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {s.quantity}
                          </span>
                          {isLowStock && (
                            <span className="block text-[10px] text-red-500 dark:text-red-400 font-medium">
                              Low stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {s.qty_sold ?? 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${Number(s.product?.product_price ?? 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {s.from_store_stock ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                              Already in store
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                              Transferred
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to="/Dashboard/Sales/Create"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200/50 dark:border-green-700/50 transition-colors"
                          >
                            <FiShoppingCart className="text-sm" />
                            Sell
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </span>
                  –
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.min(currentPage * PAGE_SIZE, totalItems)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {totalItems}
                  </span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* How it works tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex items-start gap-2 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-900/15 border border-blue-200/50 dark:border-blue-800/30"
      >
        <MdInfoOutline className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 text-lg" />
        <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <p className="font-semibold">How the store works:</p>
          <p>
            1. HQ transfers items to your store{' '}
            <FiArrowRight className="inline text-blue-500" /> 2. Accept transfers above to
            add them to inventory{' '}
            <FiArrowRight className="inline text-blue-500" /> 3. Sell items from the table
            using the <strong>Sell</strong> button or go to{' '}
            <Link
              to="/Dashboard/Sales/Create"
              className="underline font-medium text-blue-700 dark:text-blue-300"
            >
              Sales
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ──── Stat Card helper ──── */
function StatCard({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div
      className={`rounded-xl p-4 border border-gray-200/80 dark:border-gray-700/80 ${bg} backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

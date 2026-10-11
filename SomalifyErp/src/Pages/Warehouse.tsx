import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import {
  getAllWarehousesFn,
  getTransferDestinationsFn,
  ensureCompanyWarehousesFn,
  createWarehouseFn,
  getWarehouseStockFn,
  getAllTransfersFn,
  createTransferFn,
  approveTransferFn,
  completeTransferFn,
  cancelTransferFn,
  transferFromCompaniesFn,
} from '@/Redux/Slice/WarehouseSlice';
import { getAllCompaniesFn } from '@/Redux/Slice/GetAllCompaniesSlice';
import { getAllStoresFn } from '@/Redux/Slice/GetAllStoresSlice';
import { getAllPurchasesSortFn } from '@/Redux/Slice/AllPurchaseSortSlice';
import { HiOutlineCube, HiOutlineBuildingOffice } from 'react-icons/hi2';
import { FiPackage, FiArrowRight, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { MdOutlineInventory2 } from 'react-icons/md';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { GoPlus } from 'react-icons/go';

function Warehouse() {
  const dispatch = useDispatch<AppDispatch>();
  const warehouseStateRaw = useSelector((state: RootState) => state.warehouse);
  const warehouseState = warehouseStateRaw || {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    warehouses: [],
    transfers: [],
    selectedWarehouseStock: [],
    total: 0,
    transferTotal: 0,
    transferDestinations: [],
    transferDestinationsLoading: false,
    companyWarehousesEnsured: [],
    ensuringCompanyWarehouses: false,
  };
  const storesState = useSelector((state: RootState) => state.AllStores);
  const storesList = Array.isArray(storesState?.data) ? storesState.data : [];
  const companiesStateRaw = useSelector((state: RootState) => state.AllCompanies);
  const companiesState = companiesStateRaw || {
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    data: [],
    total: 0,
  };
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    warehouse_id: 0,
    to_warehouse_id: 0,
    product_id: 0,
    quantity: 0,
    notes: '',
  });
  const [activeTab, setActiveTab] = useState<'warehouses' | 'transfers' | 'companyStores'>('warehouses');
  const [transferStatusFilter, setTransferStatusFilter] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isCreateWarehouseOpen, setIsCreateWarehouseOpen] = useState(false);
  const [createWarehouseForm, setCreateWarehouseForm] = useState({
    warehouse_name: '',
    location: '',
    description: '',
  });
  
  useEffect(() => {
    dispatch(getAllWarehousesFn());
    dispatch(getAllCompaniesFn());
    dispatch(getAllStoresFn());
    dispatch(getAllTransfersFn({}));
    dispatch(getTransferDestinationsFn()); // Prefer this; fallback below uses stores + warehouses
    dispatch(getAllPurchasesSortFn({ page: 1, pageSize: 1000 })); // Fetch all purchases for company stores
  }, [dispatch]);

  useEffect(() => {
    if (selectedWarehouse) {
      dispatch(getWarehouseStockFn(selectedWarehouse));
    }
  }, [selectedWarehouse, dispatch]);

  useEffect(() => {
    if (activeTab === 'companyStores') {
      dispatch(getAllStoresFn());
    }
  }, [activeTab, dispatch]);

  // When transfer dialog opens, refresh data and ensure company warehouses so destination list can be built
  useEffect(() => {
    if (isTransferOpen) {
      dispatch(getAllWarehousesFn());
      dispatch(getAllStoresFn());
      dispatch(getTransferDestinationsFn());
    }
  }, [isTransferOpen, dispatch]);

  // Collect company IDs from stores (so we can ensure each has a warehouse for transfer dropdown)
  const companyIdsFromStores = (() => {
    const ids = new Set<string>();
    for (const store of storesList as Array<{ store_companies?: Array<{ company?: { company_id: string } }> }>) {
      for (const sc of store.store_companies || []) {
        if (sc.company?.company_id) ids.add(sc.company.company_id);
      }
    }
    return Array.from(ids);
  })();

  // As soon as transfer dialog is open and we have stores with linked companies, ensure those companies have a warehouse (backend creates if missing)
  const companyIdsKey = companyIdsFromStores.length > 0 ? [...companyIdsFromStores].sort().join(',') : '';
  useEffect(() => {
    if (isTransferOpen && companyIdsFromStores.length > 0) {
      dispatch(ensureCompanyWarehousesFn(companyIdsFromStores));
    }
  }, [isTransferOpen, companyIdsKey, dispatch]);

  // Build list: 1) from API, 2) from stores + companyWarehousesEnsured (after ensure-warehouses), 3) from stores + warehouses (fallback)
  const transferDestinations = (() => {
    const fromApi = warehouseState.transferDestinations ?? [];
    if (fromApi.length > 0) return fromApi;
    const ensured = warehouseState.companyWarehousesEnsured ?? [];
    if (ensured.length > 0 && storesList.length > 0) {
      const list: { store_name: string; company_name: string; warehouse_id: number }[] = [];
      for (const store of storesList as Array<{ store_name: string; store_companies?: Array<{ company?: { company_id: string; company_name: string } }> }>) {
        for (const sc of store.store_companies || []) {
          const companyId = sc.company?.company_id;
          if (!companyId) continue;
          const row = ensured.find((e) => e.company_id === companyId);
          if (row) {
            list.push({
              store_name: store.store_name,
              company_name: row.company_name || sc.company?.company_name || '',
              warehouse_id: row.warehouse_id,
            });
          }
        }
      }
      if (list.length > 0) return list;
    }
    const warehouses = warehouseState.warehouses || [];
    const list: { store_name: string; company_name: string; warehouse_id: number }[] = [];
    for (const store of storesList as Array<{ store_name: string; store_companies?: Array<{ company?: { company_id: string; company_name: string } }> }>) {
      const companies = store.store_companies || [];
      for (const sc of companies) {
        const companyId = sc.company?.company_id;
        if (!companyId) continue;
        const wh = warehouses.find((w: { company_id?: string | null }) => w.company_id === companyId);
        if (wh && typeof (wh as { warehouse_id: number }).warehouse_id === 'number') {
          list.push({
            store_name: store.store_name,
            company_name: sc.company?.company_name || '',
            warehouse_id: (wh as { warehouse_id: number }).warehouse_id,
          });
        }
      }
    }
    return list;
  })();
  const transferDestinationsFiltered = transferDestinations.filter(
    (d) => d.warehouse_id !== transferForm.warehouse_id
  );

  // Use stock from selected warehouse (from list API) or from dedicated stock API so transfer list always shows
  const selectedWarehouseData = (warehouseState.warehouses || []).find(
    (w: { warehouse_id: number; stock?: Array<{ product?: { product_code?: string; product_name?: string } }> }) =>
      w.warehouse_id === selectedWarehouse
  );
  const stockListForTransfer =
    (selectedWarehouseData?.stock && selectedWarehouseData.stock.length > 0
      ? selectedWarehouseData.stock
      : warehouseState.selectedWarehouseStock || []) as Array<{
      stock_id: number;
      product_id: number;
      quantity: number;
      reserved_qty: number;
      product?: { product_id?: number; product_code?: string; product_name?: string };
    }>;

  const handleTransfer = (warehouseId: number, productId: number) => {
    setTransferForm({
      warehouse_id: warehouseId,
      to_warehouse_id: 0,
      product_id: productId,
      quantity: 0,
      notes: '',
    });
    setIsTransferOpen(true);
  };

  const handleCreateTransfer = async () => {
    if (!transferForm.to_warehouse_id || !transferForm.quantity || transferForm.quantity <= 0) {
      toast.error('Please select destination store/warehouse and quantity');
      return;
    }

    try {
      await dispatch(createTransferFn(transferForm)).unwrap();
      toast.success('Transfer created successfully');
      setIsTransferOpen(false);
      dispatch(getAllTransfersFn({}));
      if (selectedWarehouse) {
        dispatch(getWarehouseStockFn(selectedWarehouse));
      }
    } catch (error: any) {
      toast.error(error || 'Failed to create transfer');
    }
  };

  const handleApproveTransfer = async (transferId: number) => {
    try {
      await dispatch(approveTransferFn(transferId)).unwrap();
      toast.success('Transfer approved');
      dispatch(getAllTransfersFn({}));
    } catch (error: any) {
      toast.error(error || 'Failed to approve transfer');
    }
  };

  const handleCompleteTransfer = async (transferId: number) => {
    try {
      const result = await dispatch(completeTransferFn(transferId)).unwrap();
      toast.success('Transfer completed successfully');
      dispatch(getAllTransfersFn({}));
      // Refresh warehouse stock for the transfer's warehouse so quantity shows correctly
      const warehouseId = result?.transfer?.warehouse_id ?? selectedWarehouse;
      if (warehouseId) {
        dispatch(getWarehouseStockFn(warehouseId));
      }
      dispatch(getAllWarehousesFn());
      dispatch(getAllPurchasesSortFn({ page: 1, pageSize: 1000 }));
    } catch (error: any) {
      toast.error(error || 'Failed to complete transfer');
    }
  };

  const handleCancelTransfer = async (transferId: number) => {
    try {
      await dispatch(cancelTransferFn(transferId)).unwrap();
      toast.success('Transfer cancelled');
      dispatch(getAllTransfersFn({}));
      if (selectedWarehouse) {
        dispatch(getWarehouseStockFn(selectedWarehouse));
      }
    } catch (error: any) {
      toast.error(error || 'Failed to cancel transfer');
    }
  };

  const handleTransferFromCompanies = async () => {
    const warehouseId = (warehouseState.warehouses || []).find(w => w.is_default)?.warehouse_id 
      ?? (warehouseState.warehouses || [])[0]?.warehouse_id;
    try {
      const result = await dispatch(transferFromCompaniesFn(
        warehouseId ? { warehouse_id: warehouseId } : {}
      )).unwrap();
      toast.success(`Transferred ${result.transferred} items to ${result.warehouse_name || 'warehouse'}`);
      dispatch(getAllWarehousesFn());
      dispatch(getAllPurchasesSortFn({ page: 1, pageSize: 1000 }));
      if (selectedWarehouse) {
        dispatch(getWarehouseStockFn(selectedWarehouse));
      }
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to transfer');
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createWarehouseForm.warehouse_name.trim()) {
      toast.error('Warehouse name is required');
      return;
    }
    try {
      await dispatch(createWarehouseFn({
        warehouse_name: createWarehouseForm.warehouse_name.trim(),
        location: createWarehouseForm.location.trim() || undefined,
        description: createWarehouseForm.description.trim() || undefined,
      })).unwrap();
      toast.success('Warehouse created');
      setIsCreateWarehouseOpen(false);
      setCreateWarehouseForm({ warehouse_name: '', location: '', description: '' });
      dispatch(getAllWarehousesFn());
    } catch (error: any) {
      const msg = typeof error === 'string' ? error : error?.message || 'Failed to create warehouse. Check backend is running on port 8181 and DB migrated.';
      toast.error(msg);
    }
  };

  const filteredTransfers = transferStatusFilter
    ? (warehouseState.transfers || []).filter(t => t.status === transferStatusFilter)
    : (warehouseState.transfers || []);

  const selectedStock =
    stockListForTransfer.find((s) => (s.product_id ?? s.product?.product_id) === transferForm.product_id) ??
    (warehouseState.selectedWarehouseStock || []).find((s: { product_id: number }) => s.product_id === transferForm.product_id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800'>
      <div className='w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6'>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                className="relative p-2.5 rounded bg-gradient-to-br from-slate-600 via-blue-600 to-indigo-600 shadow-xl"
              >
                <HiOutlineCube className="text-white text-xl" />
              </motion.div>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-400 dark:to-indigo-400'>
                  Warehouse Management
                </h1>
                <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                  Manage warehouses and transfer stock to companies
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateWarehouseOpen(true)}
              className='flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm text-white bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 shadow-lg hover:shadow-xl transition-all'
            >
              <GoPlus className="text-lg" />
              Add Warehouse
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-800/30 dark:to-blue-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Total Warehouses
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {warehouseState.isLoading ? '...' : (warehouseState.warehouses || []).length}
                  </h3>
                </div>
                <div className="p-2.5 rounded bg-gradient-to-br from-slate-600 to-blue-600 shadow-lg">
                  <HiOutlineCube className="text-white text-lg" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Total Transfers
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {warehouseState.isLoading ? '...' : (warehouseState.transfers || []).length}
                  </h3>
                </div>
                <div className="p-2.5 rounded bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                  <FiArrowRight className="text-white text-lg" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Pending Transfers
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {warehouseState.isLoading
                      ? '...'
                      : (warehouseState.transfers || []).filter(t => t.status === 'PENDING').length}
                  </h3>
                </div>
                <div className="p-2.5 rounded bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                  <FiClock className="text-white text-lg" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('warehouses')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'warehouses'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Warehouses
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'transfers'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Transfers
            </button>
            <button
              onClick={() => setActiveTab('companyStores')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'companyStores'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Company Stores
            </button>
          </div>
        </motion.div>

        {/* Warehouses Tab */}
        {activeTab === 'warehouses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MdOutlineInventory2 className="text-blue-600 dark:text-blue-400" />
                Warehouses
              </h2>
            </div>
            <div className="p-6">
              {warehouseState.isLoading ? (
                <div className="text-center py-8">Loading warehouses...</div>
              ) : (warehouseState.warehouses || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">No warehouses found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(warehouseState.warehouses || []).map((warehouse) => (
                    <motion.div
                      key={warehouse.warehouse_id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => setSelectedWarehouse(warehouse.warehouse_id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedWarehouse === warehouse.warehouse_id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {warehouse.warehouse_name}
                        </h3>
                        <HiOutlineBuildingOffice className="text-blue-600 text-xl" />
                      </div>
                      {warehouse.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          📍 {warehouse.location}
                        </p>
                      )}
                      {warehouse.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                          {warehouse.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          <FiPackage className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {warehouse.stock?.length || 0} products
                          </span>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Click to view stock →
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Stock List for Selected Warehouse */}
              {selectedWarehouse && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Stock in Warehouse
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click "Transfer" to send stock to a company store
                    </p>
                  </div>
                  {warehouseState.isLoading && !stockListForTransfer.length ? (
                    <div className="text-center py-4">Loading stock...</div>
                  ) : stockListForTransfer.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No stock in this warehouse</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                              Product Code
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                              Product Name
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                              Available Qty
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                              Reserved Qty
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {stockListForTransfer.map((stock) => {
                            const availableQty = stock.quantity - (stock.reserved_qty || 0);
                            const productId = stock.product_id ?? stock.product?.product_id;
                            return (
                              <tr key={stock.stock_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {stock.product?.product_code ?? '-'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {stock.product?.product_name ?? '-'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {availableQty}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {stock.reserved_qty ?? 0}
                                </td>
                                <td className="px-4 py-2">
                                  <button
                                    onClick={() => handleTransfer(selectedWarehouse!, productId!)}
                                    disabled={availableQty <= 0}
                                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                    title={availableQty <= 0 ? 'No available stock' : 'Transfer to store'}
                                  >
                                    <FiArrowRight className="text-xs" />
                                    Transfer
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Transfers Tab */}
        {activeTab === 'transfers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiArrowRight className="text-blue-600 dark:text-blue-400" />
                  Transfers
                </h2>
                <select
                  value={transferStatusFilter}
                  onChange={(e) => setTransferStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              {warehouseState.isLoading ? (
                <div className="text-center py-8">Loading transfers...</div>
              ) : filteredTransfers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No transfers found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                          Transfer ID
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                          Warehouse
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                          To (Store / Warehouse)
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                          Created
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTransfers.map((transfer) => (
                        <tr key={transfer.transfer_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            #{transfer.transfer_id}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {transfer.warehouse.warehouse_name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {transfer.product.product_code} - {transfer.product.product_name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {transfer.to_warehouse?.warehouse_name ?? transfer.company?.company_name ?? '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {transfer.quantity}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                transfer.status
                              )}`}
                            >
                              {transfer.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(transfer.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-2">
                              {transfer.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApproveTransfer(transfer.transfer_id)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="Approve"
                                  >
                                    <FiCheckCircle />
                                  </button>
                                  <button
                                    onClick={() => handleCancelTransfer(transfer.transfer_id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Cancel"
                                  >
                                    <FiXCircle />
                                  </button>
                                </>
                              )}
                              {transfer.status === 'APPROVED' && (
                                <>
                                  <button
                                    onClick={() => handleCompleteTransfer(transfer.transfer_id)}
                                    className="p-1 text-green-600 hover:text-green-800"
                                    title="Complete"
                                  >
                                    <FiCheckCircle />
                                  </button>
                                  <button
                                    onClick={() => handleCancelTransfer(transfer.transfer_id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Cancel"
                                  >
                                    <FiXCircle />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Company Stores Tab */}
        {activeTab === 'companyStores' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <HiOutlineBuildingOffice className="text-blue-600 dark:text-blue-400" />
                    Company Stores
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Stock the admin assigned to each company store
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Companies</option>
                    {(companiesState.data || []).map((company) => (
                      <option key={company.company_id} value={company.company_id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleTransferFromCompanies}
                    disabled={warehouseState.isLoading || (warehouseState.warehouses || []).length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                    title="Move all company purchases into the main warehouse"
                  >
                    <FiArrowRight className="rotate-180" />
                    Transfer to Warehouse
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {storesState?.isLoading && storesList.length === 0 ? (
                <div className="text-center py-8">Loading company stores...</div>
              ) : (
                (() => {
                  const companyStores = (storesList as Array<{
                    store_id: string;
                    store_name: string;
                    location: string | null;
                    store_companies?: { company: { company_id: string; company_name: string } }[];
                    store_stock?: Array<{
                      stock_id: number;
                      quantity: number | string;
                      product?: { product_code?: string; product_name?: string; product_price?: string | number };
                    }>;
                  }>).filter((store) => {
                    if (!selectedCompany) return true;
                    return (store.store_companies ?? []).some((link) => link.company?.company_id === selectedCompany);
                  });

                  if (companyStores.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        {selectedCompany
                          ? 'No stores are linked to this company.'
                          : 'No company stores found'}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {companyStores.map((store) => {
                        const stock = store.store_stock ?? [];
                        const totalQuantity = stock.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
                        const companyNames = (store.store_companies ?? [])
                          .map((link) => link.company?.company_name)
                          .filter(Boolean)
                          .join(', ');

                        return (
                          <motion.div
                            key={store.store_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <HiOutlineBuildingOffice className="text-blue-600 text-2xl" />
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {store.store_name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {companyNames || 'No linked company'}
                                      {store.location ? ` • ${store.location}` : ''}
                                      {' • '}
                                      {stock.length} products • {totalQuantity} total items
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              {stock.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4 text-center">No products in this store yet.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                                          Product Code
                                        </th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                                          Product Name
                                        </th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                                          Available Qty
                                        </th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                                          Price
                                        </th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                                          Source
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                      {stock.map((row) => (
                                        <tr key={row.stock_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                            {row.product?.product_code ?? '-'}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                            {row.product?.product_name ?? '-'}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-medium">
                                            {Number(row.quantity)}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                            {row.product?.product_price != null
                                              ? Number(row.product.product_price).toFixed(2)
                                              : '-'}
                                          </td>
                                          <td className="px-4 py-2 text-sm">
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
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          </motion.div>
        )}

        {/* Create Warehouse Modal */}
        <Dialog open={isCreateWarehouseOpen} onOpenChange={setIsCreateWarehouseOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create Warehouse</DialogTitle>
              <DialogDescription>
                Add a new warehouse. You can add stock to it later from the warehouse stock API or when receiving goods.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWarehouse} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={createWarehouseForm.warehouse_name}
                  onChange={(e) => setCreateWarehouseForm({ ...createWarehouseForm, warehouse_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. Main Warehouse"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={createWarehouseForm.location}
                  onChange={(e) => setCreateWarehouseForm({ ...createWarehouseForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Address or city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={createWarehouseForm.description}
                  onChange={(e) => setCreateWarehouseForm({ ...createWarehouseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={warehouseState.isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {warehouseState.isLoading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateWarehouseOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Transfer Form Modal */}
        <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create Transfer</DialogTitle>
              <DialogDescription>
                Transfer stock from warehouse to a company store (so they can receive and sell).
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-4">
              {selectedStock && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Product: {selectedStock.product?.product_code ?? '-'} - {selectedStock.product?.product_name ?? '-'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Available: {(selectedStock.quantity ?? 0) - (selectedStock.reserved_qty ?? 0)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Destination store *
                </label>
                <select
                  value={transferForm.to_warehouse_id || ''}
                  onChange={(e) => setTransferForm({ ...transferForm, to_warehouse_id: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  disabled={warehouseState.transferDestinationsLoading || warehouseState.ensuringCompanyWarehouses}
                >
                  <option value="">
                    {(warehouseState.transferDestinationsLoading || warehouseState.ensuringCompanyWarehouses) ? 'Loading stores...' : 'Select a store'}
                  </option>
                  {transferDestinationsFiltered.map((d) => (
                    <option key={`${d.store_name}-${d.company_name}-${d.warehouse_id}`} value={d.warehouse_id}>
                      {d.store_name}{d.company_name ? ` (${d.company_name})` : ''}
                    </option>
                  ))}
                </select>
                {!warehouseState.transferDestinationsLoading && !warehouseState.ensuringCompanyWarehouses && transferDestinationsFiltered.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    No store to transfer to. Add stores in Admin → Stores and link companies to them.
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  These are the stores from Admin → Stores. Transfer goes to the company linked to that store.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  max={selectedStock ? (selectedStock.quantity ?? 0) - (selectedStock.reserved_qty ?? 0) : undefined}
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: parseFloat(String(e.target.value).replace(',', '.')) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreateTransfer}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Transfer
                </button>
                <button
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Warehouse;

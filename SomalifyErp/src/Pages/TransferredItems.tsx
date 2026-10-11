import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import {
  getTransfersToCompanyFn,
  approveTransferFn,
  completeTransferFn,
  cancelTransferFn,
} from '@/Redux/Slice/WarehouseSlice';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
import { FiCheckCircle, FiXCircle, FiClock, FiInbox } from 'react-icons/fi';
import { MdOutlineLocalShipping, MdInfoOutline } from 'react-icons/md';
import toast from 'react-hot-toast';

type TransferStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

interface TransferRow {
  transfer_id: number;
  warehouse_id: number;
  to_warehouse_id?: number | null;
  company_id: string | null;
  product_id: number;
  quantity: number;
  status: TransferStatus;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  warehouse?: { warehouse_name?: string };
  to_warehouse?: { warehouse_name?: string } | null;
  product?: { product_name?: string; product_code?: string };
}

export default function TransferredItems() {
  const dispatch = useDispatch<AppDispatch>();
  const companyState = useSelector((state: RootState) => state.GetOneCompanay);
  const warehouseState = useSelector((state: RootState) => state.warehouse);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const companyId = companyState?.data?.company_id || userInfo?.user?.company_id || userInfo?.company_id;

  const transfersToCompany: TransferRow[] = warehouseState?.transfersToCompany ?? [];
  const pending = transfersToCompany.filter((t) => t.status === 'PENDING');
  const approved = transfersToCompany.filter((t) => t.status === 'APPROVED');
  const completed = transfersToCompany.filter((t) => t.status === 'COMPLETED');

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('pending');
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getOneCompanayFN());
  }, [dispatch]);

  useEffect(() => {
    if (companyId) {
      dispatch(getTransfersToCompanyFn({ companyId }));
    }
  }, [companyId, dispatch]);

  const handleApproveAndReceive = async (transferId: number) => {
    setLoadingAction(transferId);
    try {
      await dispatch(approveTransferFn(transferId)).unwrap();
      await dispatch(completeTransferFn(transferId)).unwrap();
      toast.success('Items received in your store');
      if (companyId) dispatch(getTransfersToCompanyFn({ companyId }));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to receive');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAcceptOnly = async (transferId: number) => {
    setLoadingAction(transferId);
    try {
      await dispatch(completeTransferFn(transferId)).unwrap();
      toast.success('Transfer accepted — items added to your store');
      if (companyId) dispatch(getTransfersToCompanyFn({ companyId }));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to accept');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDecline = async (transferId: number) => {
    setLoadingAction(transferId);
    try {
      await dispatch(cancelTransferFn(transferId)).unwrap();
      toast.success('Transfer declined');
      if (companyId) dispatch(getTransfersToCompanyFn({ companyId }));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to decline');
    } finally {
      setLoadingAction(null);
    }
  };

  const filtered =
    filter === 'pending'
      ? pending
      : filter === 'approved'
        ? approved
        : filter === 'completed'
          ? completed
          : transfersToCompany.filter((t) => t.status !== 'CANCELLED');

  if (!companyId) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Company not found. You must be logged in as a company user.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 md:px-6 lg:px-8 py-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-blue-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative p-2.5 rounded-md bg-indigo-600 shadow-xl"
          >
            <MdOutlineLocalShipping className="text-white text-2xl" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              Transferred items
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View and accept items transferred from the warehouse to your store.
            </p>
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
              <MdInfoOutline className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-200">
                If a store is linked to more than one company, all those companies can see and accept the same pending transfer. Whoever accepts receives the items into their company store.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'pending' as const, label: 'To accept', count: pending.length },
            { key: 'approved' as const, label: 'Approved', count: approved.length },
            { key: 'completed' as const, label: 'Completed', count: completed.length },
            { key: 'all' as const, label: 'All', count: transfersToCompany.filter((t) => t.status !== 'CANCELLED').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {label} {count > 0 && `(${count})`}
            </button>
          ))}
        </div>

        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl overflow-hidden bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          {warehouseState?.isLoading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Loading transfers…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
              <FiInbox className="text-4xl opacity-50" />
              <p>
                {filter === 'pending'
                  ? 'No pending transfers. When admin sends items to your store, they will appear here.'
                  : filter === 'completed'
                    ? 'No completed transfers yet.'
                    : 'No transferred items in this list.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">From</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.transfer_id}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {t.product?.product_name ?? 'Product'}
                        </span>
                        {t.product?.product_code && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({t.product.product_code})</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{t.quantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {t.warehouse?.warehouse_name ?? 'Warehouse'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            t.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                              : t.status === 'APPROVED'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                                : t.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {t.status === 'PENDING' && <FiClock />}
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {t.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={loadingAction === t.transfer_id}
                              onClick={() => handleApproveAndReceive(t.transfer_id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              {loadingAction === t.transfer_id ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <FiCheckCircle />
                              )}
                              Accept
                            </button>
                            <button
                              disabled={loadingAction === t.transfer_id}
                              onClick={() => handleDecline(t.transfer_id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              <FiXCircle />
                              Decline
                            </button>
                          </div>
                        )}
                        {t.status === 'APPROVED' && (
                          <button
                            disabled={loadingAction === t.transfer_id}
                            onClick={() => handleAcceptOnly(t.transfer_id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {loadingAction === t.transfer_id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <FiCheckCircle />
                            )}
                            Accept
                          </button>
                        )}
                        {t.status === 'COMPLETED' && (
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Received</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

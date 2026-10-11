import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import toast from 'react-hot-toast';
import { resetDelPurchase } from '@/Redux/Slice/DeletePurchase';
import { getAllPurchasesAlertFn, resetAllPurchaseAlert } from '@/Redux/Slice/productAlertSlice';

interface PurchaseData {
  product_id: number;
  product_code: string;
  product_name: string;
  total_stock: string;
  product_price: string;
  product_alert_number: number;
}

const getStatusBadge = (stock: number, threshold: number) => {
  if (threshold <= 0) return { label: '—', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' };
  if (stock <= 0) return { label: 'Out of Stock', className: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' };
  if (stock <= threshold) return { label: 'Critical', className: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' };
  return { label: 'Low', className: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' };
};

export default function DataAlertItem() {
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 20,
  });

  const toastId = "Del Purchase";
  const AllPurchaseAlertState = useSelector((state: RootState) => state.AlertItem);
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    dispatch(
      getAllPurchasesAlertFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      })
    );
  }, [dispatch, paginationModel]);

  const DeletePurchase = useSelector((state: RootState) => state.DeletePurchase);

  React.useEffect(() => {
    if (DeletePurchase.isLoading) toast.loading('Deleting!', { id: toastId });
    if (DeletePurchase.isSuccess) {
      toast.success('Purchase is deleted.', { id: toastId });
      resetAllPurchaseAlert();
      dispatch(
        getAllPurchasesAlertFn({
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
        })
      );
      dispatch(resetDelPurchase());
    }
    if (DeletePurchase.isError) {
      toast.error(DeletePurchase.errorMsg, { id: toastId });
      dispatch(resetDelPurchase());
    }
    dispatch(resetDelPurchase());
  }, [
    DeletePurchase.isLoading,
    DeletePurchase.isSuccess,
    DeletePurchase.isError,
    DeletePurchase.errorMsg,
    dispatch,
    paginationModel.page,
    paginationModel.pageSize,
  ]);

  const purchaseData = Array.isArray(AllPurchaseAlertState?.data?.lowStockProducts)
    ? AllPurchaseAlertState.data.lowStockProducts
    : [];

  const columns: GridColDef[] = [
    {
      field: 'product_id',
      headerName: 'ID',
      width: 80,
      flex: 0,
      renderCell: (params) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">#{params.value}</span>
      ),
    },
    {
      field: 'product_name',
      headerName: 'Product Name',
      width: 220,
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <span className="font-medium text-gray-900 dark:text-white truncate">{params.value}</span>
      ),
    },
    {
      field: 'product_code',
      headerName: 'Product Code',
      width: 140,
      flex: 0,
      renderCell: (params) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{params.value}</span>
      ),
    },
    {
      field: 'product_alert_number',
      headerName: 'Alert Threshold',
      width: 130,
      flex: 0,
      renderCell: (params) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">{params.value}</span>
      ),
    },
    {
      field: 'total_stock',
      headerName: 'Current Stock',
      width: 130,
      flex: 0,
      renderCell: (params) => {
        const stock = parseInt(String(params.value || '0'), 10);
        const threshold = params.row.product_alert_number || 0;
        const isCritical = threshold > 0 && stock <= threshold;
        return (
          <span
            className={`font-bold ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      flex: 0,
      sortable: false,
      renderCell: (params) => {
        const stock = parseInt(String(params.row.total_stock || '0'), 10);
        const threshold = params.row.product_alert_number || 0;
        const { label, className } = getStatusBadge(stock, threshold);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${className}`}
          >
            {label}
          </span>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 520, minHeight: 400 }}>
        <DataGrid
          rows={purchaseData.map((product: PurchaseData) => ({
            id: product.product_id,
            ...product,
          }))}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 30, 50]}
          rowCount={AllPurchaseAlertState?.total ?? 0}
          paginationMode="server"
          loading={AllPurchaseAlertState?.isLoading}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#1d4ed8',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.04)',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(147, 197, 253, 0.2)',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'rgba(239, 246, 255, 0.8)',
              borderTop: '1px solid rgba(147, 197, 253, 0.3)',
            },
            '& .MuiTablePagination-root': {
              color: '#1d4ed8',
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-12">
                <span className="text-5xl mb-4">✅</span>
                <p className="font-semibold text-lg">All good!</p>
                <p className="text-sm">No products are below their alert threshold.</p>
              </div>
            ),
          }}
        />
      </Box>
    </Box>
  );
}

import { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { resetAllPayable } from '@/Redux/Slice/GetAllPayableSlice';
import './PayablesTable.css';
import toast from 'react-hot-toast';

function formatCurrency(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

function formatNumber(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return String(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export default function PayablesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const GetAllPayable = useSelector((state: RootState) => state.AllPayable);
  const location = useLocation();
  const basePath = location.pathname.includes('/AdminDashboard/') ? 'AdminDashboard' : 'Dashboard';

  const columns: GridColDef[] = useMemo(() => [
    { field: 'vendor_name', headerName: 'Vendor', minWidth: 140, flex: 1, valueFormatter: (value: any) => value != null && value !== '' ? String(value) : '—' },
    { field: 'vendor_phone', headerName: 'Phone', minWidth: 120, flex: 0.8, valueFormatter: (value: any) => value != null && value !== '' ? String(value) : '—' },
    { field: 'vendor_address', headerName: 'Address', minWidth: 160, flex: 1.2, valueFormatter: (value: any) => value != null && value !== '' ? String(value) : '—' },
    { field: 'product_name', headerName: 'Product', minWidth: 140, flex: 1, valueFormatter: (value: any) => value != null && value !== '' ? String(value) : '—' },
    { field: 'purchase_qty', headerName: 'Qty', minWidth: 80, flex: 0.5, type: 'number', valueFormatter: (value: any) => formatNumber(value) },
    { field: 'item_cost', headerName: 'Unit Cost', minWidth: 100, flex: 0.6, valueFormatter: (value: any) => formatCurrency(value) },
    { field: 'total_cost', headerName: 'Total Cost', minWidth: 110, flex: 0.6, valueFormatter: (value: any) => formatCurrency(value) },
    { field: 'purchase_discount', headerName: 'Discount', minWidth: 100, flex: 0.6, valueFormatter: (value: any) => formatCurrency(value) },
    { field: 'debt', headerName: 'Debt', minWidth: 100, flex: 0.6, valueFormatter: (value: any) => formatCurrency(value) },
    {
      field: 'action',
      headerName: 'Action',
      minWidth: 100,
      flex: 0.5,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Link
          to={`/${basePath}/Payables/payment/${params.row.purchase_id}`}
          state={{ company_id: params.row.company_id }}
          className="pay-now-link"
        >
          <span className="pay-now-btn">Pay</span>
        </Link>
      ),
    },
  ], [basePath]);

  useEffect(() => {
    if (GetAllPayable.isError) {
      toast.error(GetAllPayable.errorMsg, { id: 'payable-error' });
      dispatch(resetAllPayable());
    }
  }, [GetAllPayable.isError, GetAllPayable.errorMsg, dispatch]);

  const data = Array.isArray(GetAllPayable.data) ? GetAllPayable.data : [];
  const rows = data.map((payable: any) => ({
    id: payable.purchase_id ?? `p-${String(payable.vendor_name ?? '')}-${String(payable.product_name ?? '')}`.replace(/\s+/g, '-'),
    vendor_name: payable.vendor_name ?? '',
    vendor_phone: payable.vendor_phone ?? '',
    vendor_address: payable.vendor_address ?? '',
    product_name: payable.product_name ?? '',
    product_code: payable.product_code ?? '',
    purchase_id: payable.purchase_id,
    purchase_qty: payable.purchase_qty,
    item_cost: payable.item_cost,
    total_cost: payable.total_cost,
    purchase_discount: payable.purchase_discount,
    debt: payable.debt,
    paid_amount: payable.paid_amount,
    total_paid_and_discount: payable.total_paid_and_discount,
    created_at: payable.created_at,
    company_id: payable.company_id,
  }));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, width: '100%', minWidth: 0, overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={GetAllPayable.isLoading}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          autoHeight={false}
          disableColumnMenu={false}
          disableRowSelectionOnClick
          sx={{
            width: '100%',
            minWidth: 0,
            border: 'none',
            '& .MuiDataGrid-root': {
              width: '100%',
              minWidth: 0,
              border: 'none',
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-main': {
              width: '100%',
              minWidth: 0,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              padding: '14px 16px',
              paddingTop: '14px',
              paddingBottom: '14px',
              fontSize: '14px',
              color: 'rgb(55, 65, 81)',
              minWidth: 0,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              transition: 'background-color 0.2s ease',
              width: '100%',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(249, 250, 251, 0.8)',
              borderBottom: '2px solid rgba(239, 68, 68, 0.1)',
              padding: '14px 16px',
              paddingTop: '14px',
              paddingBottom: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgb(17, 24, 39)',
              width: '100%',
            },
            '& .MuiDataGrid-columnHeader': {
              paddingTop: '14px',
              paddingBottom: '14px',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              width: '100%',
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: '16px',
            },
            '& .MuiButton-root': {
              color: 'rgb(239, 68, 68)',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
            },
            '& .MuiDataGrid-virtualScroller': {
              width: '100%',
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              width: '100%',
            },
          }}
        />
      </Box>
    </Box>
  );
}

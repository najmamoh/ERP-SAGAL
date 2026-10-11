import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllReceiveAbleFn, resetAllRecieve } from '@/Redux/Slice/ReceiveAbleSlice';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const columns: GridColDef[] = [
  {
    field: 'index',
    headerName: '#',
    width: 56,
    minWidth: 56,
    sortable: false,
    renderCell: (params: any) => {
      if (!params?.api) return null;
      const page = params.api.state.pagination.paginationModel.page;
      const pageSize = params.api.state.pagination.paginationModel.pageSize;
      const rowIndex = page * pageSize + params.api.getAllRowIds().indexOf(params.id) + 1;
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs">
          {rowIndex}
        </span>
      );
    },
  },
  { field: 'customer_name', headerName: 'Customer', width: 160, minWidth: 120 },
  { field: 'customer_phone', headerName: 'Phone', width: 130, minWidth: 100 },
  {
    field: 'sale_date',
    headerName: 'Date',
    width: 110,
    minWidth: 95,
    valueFormatter: (value: any) => {
      return value ? format(new Date(value as string), 'yyyy-MM-dd') : '—';
    },
  },
  { field: 'product_name', headerName: 'Product', width: 240, minWidth: 140, flex: 1 },
  {
    field: 'sale_qty',
    headerName: 'Qty',
    width: 70,
    minWidth: 60,
    valueFormatter: (value: any) => {
      const n = parseFloat(String(value ?? 0).replace(',', '.'));
      return Number.isNaN(n) ? '0' : String(n);
    },
    renderCell: (params: any) => (
      <span className="tabular-nums">
        {Number.isNaN(parseFloat(String(params.value ?? 0))) ? '0' : parseFloat(String(params.value ?? 0).replace(',', '.'))}
      </span>
    ),
  },
  {
    field: 'total_price',
    headerName: 'Total',
    width: 110,
    minWidth: 90,
    renderCell: (params: any) => (
      <span className="font-semibold text-slate-800 tabular-nums">
        ${parseFloat(String(params?.value ?? 0)).toFixed(2)}
      </span>
    ),
  },
  {
    field: 'received_amount',
    headerName: 'Received',
    width: 110,
    minWidth: 90,
    renderCell: (params: any) => (
      <span className="text-emerald-600 tabular-nums font-medium">
        ${parseFloat(String(params?.value ?? 0)).toFixed(2)}
      </span>
    ),
  },
  {
    field: 'credit',
    headerName: 'Due',
    width: 110,
    minWidth: 90,
    renderCell: (params: any) => {
      const due = parseFloat(String(params?.value ?? 0));
      return (
        <span className={due > 0 ? 'font-semibold text-amber-600 tabular-nums' : 'text-slate-500 tabular-nums'}>
          ${due.toFixed(2)}
        </span>
      );
    },
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 100,
    minWidth: 90,
    sortable: false,
    renderCell: (params: any) => (
      <Link to={`/Dashboard/Receiveable/RecieveAblepayment/${params?.row?.sale_id ?? ''}`}>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm">
          Pay
        </button>
      </Link>
    ),
  },
];

interface RecieveTableProps {
  /** When on admin dashboard, pass selected company id to filter receivables. */
  selectedCompanyId?: string;
}

export default function RecieveTable({ selectedCompanyId }: RecieveTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const ReceiveAbleState = useSelector((state: RootState) => state.AllReceive);
  const rawData = ReceiveAbleState.data;
  const data = Array.isArray(rawData) ? rawData : (rawData as { data?: typeof rawData })?.data ?? [];

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const isAdminDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/AdminDashboard');

  useEffect(() => {
    // Admin must select a company to see receivables; company dashboard uses token
    if (isAdminDashboard && !selectedCompanyId) {
      return;
    }
    dispatch(
      getAllReceiveAbleFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        ...(selectedCompanyId ? { company_id: selectedCompanyId } : {}),
      })
    );
  }, [dispatch, paginationModel, isAdminDashboard, selectedCompanyId]);

  useEffect(() => {
    const toastId = 'toastw';
    if (ReceiveAbleState.isLoading) toast.loading('Loading...', { id: toastId });
    if (ReceiveAbleState.isError) {
      toast.error(ReceiveAbleState.errorMsg, { id: toastId });
    }
    dispatch(resetAllRecieve());
  }, [ReceiveAbleState.isLoading, ReceiveAbleState.isError, dispatch]);

  const rows = useMemo(
    () =>
      data.map((receive) => ({
        id: receive.sale_id ?? `id-${Math.random().toString(36).slice(2, 9)}`,
        ...receive,
      })),
    [data]
  );

  const totalCredit = useMemo(
    () => data.reduce((acc, item) => acc + parseFloat(item.credit || '0'), 0),
    [data]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center gap-4 rounded-2xl bg-blue-100 border border-indigo-500/20 px-5 py-3 shadow-sm">
          <span className="text-sm font-medium text-slate-600">Total Due (Receivable)</span>
          <span className="text-xl font-bold tabular-nums tracking-tight text-slate-800">
            ${totalCredit.toFixed(2)}
          </span>
        </div>
        <span className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{ReceiveAbleState.total ?? data.length}</span> item
          {(ReceiveAbleState.total ?? data.length) !== 1 ? 's' : ''} in list
        </span>
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={ReceiveAbleState.isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[20, 30, 50]}
        paginationMode="server"
        rowCount={ReceiveAbleState.total ?? rows.length}
        checkboxSelection
        autoHeight
        sx={{
          border: 'none',
          fontSize: '0.875rem',
          '& .MuiDataGrid-main': { borderRadius: 12 },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f1f5f9',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#475569',
            borderBottom: '2px solid #e2e8f0',
            minHeight: '48px !important',
            maxHeight: '48px !important',
          },
          '& .MuiDataGrid-row': { borderBottom: '1px solid #f1f5f9' },
          '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fafc' },
          '& .MuiDataGrid-cell': { py: 1.25, padding: '8px 16px' },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            minHeight: 52,
          },
          '& .MuiDataGrid-checkboxInput': { width: 16, height: 16, padding: 0, transform: 'scale(0.9)' },
        }}
      />
    </Box>
  );
}

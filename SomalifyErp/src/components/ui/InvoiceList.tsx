import * as React from 'react';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getAllInvoiceFn, resetAllInvoice } from '@/Redux/Slice/InvoicesSlice';



// Define interface for invoice data
// interface Invoicedata{
//     id: string;
//     invoice_number: string;
//     issue_date: string;
//     due_date: string;
//     status: string;
//     total_amount: string;
//     tax_amount: string;
//     company_id: string;
//     customer_id: number;
//     created_at: string;
//     updated_at: string;
//     sale_id: number;
//         items: [
//             {
//                 id: number;
//         quantity: number;
//         unit_price: string;
//         discount: string;
//         product_id: number;
//         invoice_id: string;
//         product: {
//             product_id: number;
//             product_code: string;
//             product_name: string;
//             product_cost: string;
//             product_price: string;
//             product_alert_number: number;
//             company_id: string;
//             created_at: string;
//             updated_at: string;
//         };
                
//             }
//         ],
//         customer?: {
//             customer_id: number;
//             customer_name: string;
//             customer_address: string;
//             customer_phone: string;
//             company_id: string;
//             created_at: string;
//             updated_at: string;
//         },
//         company: {
//             company_id: string;
//             company_name: string;
//             company_address: string;
//             company_phone: string;
//             company_email: string;
//             subscribtion_fee: string;
//             taxable: boolean;
//             tax_percentage: number;
//             created_at: string;
//             updated_at: string;
//             created_by: number | null;
//         }
//         total: number;
//         page: number;
//         pageSize: number;
//         totalPages: number;
// }

  
//   interface InvoiceResponse {
//     data: Invoice[];
//     total: number;
//     page: number;
//     pageSize: number;
//     totalPages: number;
//   }


const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PARTIAL: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  VOID: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  ISSUED: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500' },
};

const columns: GridColDef[] = [
  {
    field: 'index',
    headerName: '#',
    width: 56,
    minWidth: 56,
    sortable: false,
    renderCell: (params) => {
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
  { field: 'invoice_number', headerName: 'Invoice #', width: 140, minWidth: 120 },
  {
    field: 'issue_date',
    headerName: 'Issue Date',
    width: 115,
    minWidth: 100,
    valueFormatter: (value: any) => (value ? format(new Date(value), 'yyyy-MM-dd') : ''),
  },
  {
    field: 'due_date',
    headerName: 'Due Date',
    width: 115,
    minWidth: 100,
    valueFormatter: (value: any) => (value ? format(new Date(value), 'yyyy-MM-dd') : ''),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    minWidth: 88,
    renderCell: (params) => {
      const config = statusConfig[params.value as string] || statusConfig.ISSUED;
      return (
        <span className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} px-2.5 py-1.5 rounded-lg text-xs font-semibold`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {params.value}
        </span>
      );
    },
  },
  {
    field: 'customer',
    headerName: 'Customer',
    width: 180,
    minWidth: 140,
    renderCell: (params) => (
      <span className="truncate block max-w-[160px]" title={params.row.customer?.customer_name}>
        {params.row.customer?.customer_name || '—'}
      </span>
    ),
  },
  {
    field: 'total_amount',
    headerName: 'Total',
    width: 115,
    minWidth: 95,
    renderCell: (params) => (
      <span className="font-bold text-slate-800 tabular-nums">
        ${parseFloat(String(params.value || 0)).toFixed(2)}
      </span>
    ),
  },
  {
    field: 'tax_amount',
    headerName: 'Tax',
    width: 90,
    minWidth: 75,
    renderCell: (params) => (
      <span className="text-gray-600">${parseFloat(String(params.value || 0)).toFixed(2)}</span>
    ),
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 85,
    minWidth: 85,
    sortable: false,
    renderCell: (params) => <ActionCell {...params} />,
  },
];

export const ActionCell = (params: { row: { id: string; sale_id?: number }; [key: string]: unknown }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent) => setAnchorEl(event.currentTarget as HTMLElement);
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
        aria-label="Actions"
      >
        <MoreVertIcon sx={{ fontSize: 20 }} />
      </button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 48 * 3,
            minWidth: 100,
            borderRadius: 8,
            boxShadow: '0 10px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
            mt: 1,
          },
        }}
        MenuListProps={{ sx: { py: 0 } }}
      >
        <Link to={`/Dashboard/invoices/${params.row.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={handleClose} sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5, minHeight: 32 }}>View</MenuItem>
        </Link>
        <Link to={params.row.sale_id != null ? `/Dashboard/Sales/Update/${params.row.sale_id}` : `/Dashboard/invoices/${params.row.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={handleClose} sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5, minHeight: 32 }}>Update</MenuItem>
        </Link>
      </Menu>
    </div>
  );
};

export default function InvoiceData() {
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 20 });
  const dispatch = useDispatch<AppDispatch>();
  const AllInvoiceState = useSelector((state: RootState) => state.AllInvoice);
  const data = AllInvoiceState.data ?? [];

  React.useEffect(() => {
    dispatch(
      getAllInvoiceFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      })
    );
  }, [dispatch, paginationModel]);

  React.useEffect(() => {
    if (AllInvoiceState.isError) {
      toast.error(AllInvoiceState.errorMsg, { id: 'invoice-error' });
    }
    dispatch(resetAllInvoice());
  }, [AllInvoiceState.isError, dispatch]);

  const total = useMemo(
    () => data.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || 0)), 0),
    [data]
  );

  const rows = useMemo(
    () => data.map((inv) => ({ ...inv, id: inv.id })),
    [data]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center gap-4 rounded-2xl bg-blue-100 border border-indigo-500/20 px-5 py-3.5 shadow-sm">
          <span className="text-sm font-medium text-slate-600">Total Invoiced</span>
          <span className="text-xl font-bold tabular-nums tracking-tight text-slate-800">${total.toFixed(2)}</span>
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{AllInvoiceState.total ?? 0}</span> invoice{AllInvoiceState.total !== 1 ? 's' : ''} in list
        </div>
      </div>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[20, 30, 50]}
        rowCount={AllInvoiceState.total}
        paginationMode="server"
        checkboxSelection
        loading={AllInvoiceState.isLoading}
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
          '& .MuiDataGrid-row': {
            borderBottom: '1px solid #f1f5f9',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f8fafc',
          },
          '& .MuiDataGrid-cell': {
            py: 1.25,
            padding: '8px 16px',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            minHeight: 52,
          },
          '& .MuiDataGrid-checkboxInput': {
            width: 16,
            height: 16,
            padding: 0,
            transform: 'scale(0.9)',
          },
        }}
      />
    </Box>
  );
}
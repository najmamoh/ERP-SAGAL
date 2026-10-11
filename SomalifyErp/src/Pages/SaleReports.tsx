// src/components/SaleReports.tsx
import { getAllSaleFn, setPagination } from "@/Redux/Slice/GetAllSaleSlice";
import { AppDispatch, RootState } from "@/Redux/Store";
import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { getOneCompanayFN } from "@/Redux/Slice/GetOneCompanaySlice";
import { CompanyFilter } from "@/components/ui/CompanyFilter";
import { useLocation } from "react-router-dom";

function SaleReports() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes('/AdminDashboard');
  const dispatch = useDispatch<AppDispatch>();
  const GetAllSaleState = useSelector((state: RootState) => state.GetSale);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState("");
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(20);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("reportCompanyId") || "" : ""
  );

  const GetOneCompanayState = useSelector((state: RootState) => state.GetOneCompanay);
  const defaultCompanyId = GetOneCompanayState.data?.company_id ?? JSON.parse(localStorage.getItem('userInfo') || '{}')?.user?.company_id ?? JSON.parse(localStorage.getItem('userInfo') || '{}')?.company_id;
  const companyId = selectedCompanyId || sessionStorage.getItem('reportCompanyId') || defaultCompanyId || '';

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate && companyId) {
      dispatch(getAllSaleFn({
        startDate,
        endDate,
        page: localPage,
        pageSize: localPageSize,
        company_id: companyId
      }));
    }
  };

  const handlePaginationChange = (newPagination: any) => {
    const newPage = newPagination.page + 1; // MUI uses 0-based index
    setLocalPage(newPage);
    setLocalPageSize(newPagination.pageSize);
    dispatch(setPagination({ page: newPage, pageSize: newPagination.pageSize }));
  };

  const reportData = Array.isArray(GetAllSaleState.data) ? GetAllSaleState.data : [];

  const statusColors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    OVERDUE: 'bg-red-100 text-red-700',
    ISSUED: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    VOID: 'bg-gray-200 text-gray-500',
  };

  const money = (v: unknown) => {
    if (v == null || v === '') return '—';
    const n = Number(v);
    return Number.isNaN(n) ? '—' : `$${n.toFixed(2)}`;
  };

  const columns: GridColDef[] = [
  
    {
      field: "invoice_number",
      headerName: "Invoice #",
      width: 118,
      renderCell: (params) => (
        <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm">{params.value || '—'}</span>
      ),
    },
    // {
    //   field: "invoice_id",
    //   headerName: "Invoice ID",
    //   width: 200,
    //   renderCell: (params) => (
    //     <span className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate max-w-[190px] block" title={String(params.value ?? '')}>
    //       {params.value || '—'}
    //     </span>
    //   ),
    // },
    // {
    //   field: "invoice_sale_id",
    //   headerName: "Invoice sale #",
    //   width: 110,
    //   align: "center",
    //   headerAlign: "center",
    //   renderCell: (p) => <span className="text-sm tabular-nums">{p.value ?? '—'}</span>,
    // },
    // {
    //   field: "sale_id",
    //   headerName: "Sale ID",
    //   width: 88,
    //   align: "center",
    //   headerAlign: "center",
    //   renderCell: (p) => <span className="font-semibold text-sm tabular-nums">{p.value ?? '—'}</span>,
    // },
    {
      field: "product_name",
      headerName: "Item",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <span className="font-medium text-gray-900 dark:text-white text-sm">{params.value || '—'}</span>
      ),
    },
    // {
    //   field: "product_code",
    //   headerName: "SKU / Code",
    //   width: 110,
    //   renderCell: (p) => <span className="text-xs text-gray-600 dark:text-gray-400">{p.value || '—'}</span>,
    // },
    {
      field: "sale_qty",
      headerName: "Qty",
      width: 64,
      align: "center",
      headerAlign: "center",
      renderCell: (params: any) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300">{Number(params.value ?? 0)}</div>
      ),
    },
    {
      field: "unit_purchase_cost",
      headerName: "Unit cost (purchase)",
      width: 130,
      align: "right",
      headerAlign: "right",
      description: "Cost per unit from purchase record when linked; else stock / latest purchase",
      renderCell: (p) => <div className="tabular-nums text-gray-700 dark:text-gray-300">{money(p.value)}</div>,
    },
    {
      field: "line_purchase_cost",
      headerName: "Line purchase cost",
      width: 130,
      align: "right",
      headerAlign: "right",
      renderCell: (p) => (
        <div className="tabular-nums text-gray-600 dark:text-gray-400">{money(p.value ?? p.row.item_cost)}</div>
      ),
    },
    {
      field: "unit_sale_price",
      headerName: "Unit price (sale)",
      width: 118,
      align: "right",
      headerAlign: "right",
      renderCell: (params) =>
        params.value == null || params.value === '' ? (
          <span className="text-gray-400">—</span>
        ) : (
          <span className="tabular-nums text-gray-700 dark:text-gray-300">${Number(params.value).toFixed(2)}</span>
        ),
    },
    {
      field: "item_price",
      headerName: "Line total (sale)",
      width: 120,
      align: "right",
      headerAlign: "right",
      description: "After line discount: qty × unit sale price − discount",
      renderCell: (params) => (
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg px-2 py-1 text-center font-medium text-sm tabular-nums">
          ${Number(params.value || 0).toFixed(2)}
        </div>
      ),
    },
    {
      field: "sale_discount",
      headerName: "Discount",
      width: 92,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <div className="text-orange-600 dark:text-orange-400 tabular-nums">${Number(params.value || 0).toFixed(2)}</div>
      ),
    },
    {
      field: "received_amount",
      headerName: "Received",
      width: 100,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <div className="text-green-600 dark:text-green-400 font-semibold tabular-nums">${Number(params.value || 0).toFixed(2)}</div>
      ),
    },
    {
      field: "gross_profit",
      headerName: "Gross profit",
      width: 118,
      align: "right",
      headerAlign: "right",
      description: "Line sale total (after discount) minus line purchase cost — margin on the sale",
      renderCell: (params) => {
        const row = params.row as any;
        let g = row.gross_profit != null ? Number(row.gross_profit) : NaN;
        if (Number.isNaN(g)) {
          const cost = Number(row.line_purchase_cost ?? row.item_cost ?? 0);
          const netLine = Number(row.item_price || 0);
          g = netLine - cost;
        }
        return (
          <div className={`tabular-nums text-gray-700 dark:text-gray-300 ${g >= 0 ? '' : 'text-red-600'}`}>
            ${Number(g).toFixed(2)}
          </div>
        );
      },
    },
    {
      field: "profit",
      headerName: "Profit (cash)",
      width: 118,
      align: "right",
      headerAlign: "right",
      description: "Cash received minus line purchase cost (e.g. qty×unit cost $10, received $24 ⇒ $14)",
      renderCell: (params) => {
        const row = params.row as any;
        let profit = row.profit != null ? Number(row.profit) : NaN;
        if (Number.isNaN(profit)) {
          const cost = Number(row.line_purchase_cost ?? row.item_cost ?? 0);
          const received = Number(row.received_amount || 0);
          profit = received - cost;
        }
        return (
          <div className={`font-semibold tabular-nums ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${Number(profit).toFixed(2)}
          </div>
        );
      },
    },
    {
      field: "balance_due",
      headerName: "Balance due",
      width: 100,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const row = params.row as any;
        let debt = row.balance_due != null ? Number(row.balance_due) : NaN;
        if (Number.isNaN(debt)) {
          const netLine = Number(row.item_price || 0);
          const received = Number(row.received_amount || 0);
          debt = Math.max(0, netLine - received);
        }
        return (
          <div className={`font-semibold tabular-nums ${debt > 0.005 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {debt > 0.005 ? `$${Number(debt).toFixed(2)}` : '—'}
          </div>
        );
      },
    },
    {
      field: "customer_name",
      headerName: "Customer",
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">{params.value || 'N/A'}</div>
          {params.row.customer_phone && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{params.row.customer_phone}</div>
          )}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 88,
      renderCell: (params) => {
        const s = String(params.value || '');
        return (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[s] ?? 'bg-gray-100 text-gray-600'}`}>
            {s || '—'}
          </span>
        );
      },
    },
    {
      field: "sold_by",
      headerName: "Sold by",
      width: 120,
      renderCell: (params) => (
        <div className="text-xs text-gray-600 dark:text-gray-400">{params.value || 'N/A'}</div>
      ),
    },
    {
      field: "created_at",
      headerName: "Date",
      width: 112,
      valueFormatter: (value: any) => {
        if (value == null || value === '') return '—';
        try {
          const d = new Date(value);
          return isNaN(d.getTime()) ? String(value) : format(d, 'yyyy-MM-dd');
        } catch {
          return String(value);
        }
      },
    }
  ];

  useEffect(() => { dispatch(getOneCompanayFN()); }, [dispatch]);

  useEffect(() => {
    if (selectedCompanyId) {
      sessionStorage.setItem("reportCompanyId", selectedCompanyId);
    }
  }, [selectedCompanyId]);

  return (
    <div className="h-screen overflow-auto bg-gray-50 dark:bg-gray-900">
      {/* NAV & Sidebar */}
      <div className="p-3 flex items-center justify-between">
      </div>

      {/* Back Button */}
      <Link to={isAdminDashboard ? "/AdminDashboard/Home" : "/Dashboard/Reports"}>
        <h1 className="text-2xl p-3 hover:text-blue-500 transition cursor-pointer"><IoArrowBack /></h1>
      </Link>

      {/* Header */}
      <div className="flex flex-col justify-center items-center mx-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 uppercase">
          {GetOneCompanayState.data?.company_name || (isAdminDashboard ? "Sales Report" : "Company")}
        </h1>
        <h2 className="text-lg text-gray-600 dark:text-gray-300">Sales Report</h2>
        
      </div>

      {/* Filters */}
      <form onSubmit={submitHandler} className="flex flex-col sm:flex-row justify-center items-center gap-4 mx-6 mb-4 flex-wrap">
        <div className="flex flex-col w-full sm:w-auto">
          <label className="mb-1 text-gray-600 dark:text-gray-300">Company</label>
          <CompanyFilter onCompanyChange={setSelectedCompanyId} selectedCompanyId={selectedCompanyId} />
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label className="mb-1 text-gray-600 dark:text-gray-300">Start Date</label>
          <input
            type="date"
            className="rounded-xl p-2 border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label className="mb-1 text-gray-600 dark:text-gray-300">End Date</label>
          <input
            type="date"
            className="rounded-xl p-2 border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-800 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition-all mt-2 sm:mt-8"
        >
          Get Sales Report
        </button>
      </form>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mt-3 p-4 overflow-x-auto w-[98%] max-w-[1600px] mx-6">
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <DataGrid
            rows={reportData.map((sale, idx) => ({ id: sale.sale_id ?? `row-${idx}`, ...sale }))}
            columns={columns}
            paginationModel={{ page: localPage - 1, pageSize: localPageSize }}
            rowCount={GetAllSaleState.total}
            pageSizeOptions={[10, 20, 50]}
            onPaginationModelChange={handlePaginationChange}
            paginationMode="server"
            loading={GetAllSaleState.isLoading}
            sx={{
              border: 'none',
              fontSize: '0.85rem',
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: '#f9fafb',
                fontWeight: 600,
                fontSize: '0.875rem',
              },
              "& .MuiDataGrid-row": {
                borderBottom: '1px solid #f1f5f9',
                borderRadius: '8px',
                margin: '4px 0',
              },
              "& .MuiDataGrid-row:hover": { backgroundColor: '#f1f5f9' },
              "& .MuiDataGrid-cell": { py: 0.5, px: 2 },
              "& .MuiDataGrid-footerContainer": { borderTop: '1px solid #e5e7eb' },
              "& .MuiDataGrid-checkboxInput": { width: 14, height: 14, transform: 'scale(0.8)' },
            }}
          />

          {/* Summary – 100% from backend (report_summary) when available */}
          {(() => {
            const summary = GetAllSaleState.report_summary;
            if (summary) {
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total purchase cost</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">${summary.total_cost}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total sale (after discount)</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">${summary.total_sale_price}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total discount</div>
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">${summary.total_discount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total received (cash in)</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">${summary.total_received}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total gross profit</div>
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${summary.total_gross_profit ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total profit (cash)</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">${summary.total_profit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total balance due</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">${summary.total_balance_due ?? '0.00'}</div>
                  </div>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Sales (After Discount)</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    ${reportData.reduce((t, s) => t + (Number(s.item_price || 0) - Number(s.sale_discount || 0)), 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Received</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${reportData.reduce((t, s) => t + Number(s.received_amount || 0), 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Profit</div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${reportData.reduce((t, s: any) => t + (s.profit != null ? Number(s.profit) : (Number(s.item_price || 0) - Number(s.sale_discount || 0) - Number(s.item_cost || 0))), 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Debt</div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    ${reportData.reduce((t, s: any) => t + (s.balance_due != null ? Number(s.balance_due) : Math.max(0, (Number(s.item_price || 0) - Number(s.sale_discount || 0) - Number(s.received_amount || 0)))), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })()}
        </Box>
      </div>
    </div>
  );
}

export default SaleReports;

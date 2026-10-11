"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store";
import { Link } from "react-router-dom";
import { getAllSaleListFn, resetAllSales } from "@/Redux/Slice/AllSalesSlice";
import { delSaleFn, resetDelSale } from "@/Redux/Slice/DeleteSale";
import toast from "react-hot-toast";
import { format, isValid } from "date-fns";
import { HiOutlineShoppingCart, HiOutlineCurrencyDollar, HiOutlineCube, HiOutlinePlus } from "react-icons/hi2";
import { useCompanyPermissions } from "@/hooks/useCompanyPermissions";
import { FiEye, FiTrash2 } from "react-icons/fi";

const ActionCell = (params: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      dispatch(delSaleFn(params.row.sale_id));
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to={`/Dashboard/Sales/Update/${params.row.sale_id}`}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <FiEye className="w-3.5 h-3.5" />
        View
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors"
      >
        <FiTrash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
};

const columns: GridColDef[] = [
  { field: "sale_id", headerName: "ID", minWidth: 70, flex: 0.5 },
  {
    field: "product_name",
    headerName: "Products",
    minWidth: 220,
    flex: 1.2,
    renderCell: (params: any) => {
      // Prefer backend's comma-separated list of all products; fallback to first product only
      const name =
        (params.row.product_name && String(params.row.product_name).trim()) ||
        params.row.product_purchases?.products?.product_name ||
        params.row.warehouse_stock?.product?.product_name ||
        "N/A";
      return (
        <span className="font-medium text-slate-800 block whitespace-normal py-1" title={name}>
          {name}
        </span>
      );
    },
  },
  {
    field: "sale_qty",
    headerName: "Qty",
    minWidth: 60,
    flex: 0.4,
    valueFormatter: (value: any) => {
      const n = parseFloat(String(value ?? 0).replace(',', '.'));
      return Number.isNaN(n) ? '0' : String(n);
    },
    renderCell: (params: any) => (
      <span className="tabular-nums">
        {(() => {
          const n = parseFloat(String(params.value ?? params.row?.sale_qty ?? 0).replace(',', '.'));
          return Number.isNaN(n) ? '0' : n;
        })()}
      </span>
    ),
  },
  {
    field: "item_price",
    headerName: "Price",
    minWidth: 80,
    flex: 0.5,
    renderCell: (params) => (
      <span className="tabular-nums text-slate-700">
        ${Number(params.value || 0).toFixed(2)}
      </span>
    ),
  },
  {
    field: "sale_discount",
    headerName: "Discount",
    minWidth: 80,
    flex: 0.5,
    renderCell: (params) => (
      <span className="tabular-nums text-amber-600">${Number(params.value || 0).toFixed(2)}</span>
    ),
  },
  {
    field: "received_amount",
    headerName: "Received",
    minWidth: 90,
    flex: 0.6,
    renderCell: (params) => (
      <span className="tabular-nums font-medium text-emerald-600">
        ${Number(params.value || 0).toFixed(2)}
      </span>
    ),
  },
  {
    field: "sold_by",
    headerName: "Sold By",
    minWidth: 110,
    flex: 0.7,
    renderCell: (params: any) => (
      <span className="text-slate-600 text-sm">{params.row.company_users?.full_name || "—"}</span>
    ),
  },
  {
    field: "created_at",
    headerName: "Date",
    minWidth: 100,
    flex: 0.6,
    valueFormatter: (value: any) => {
      if (value == null || value === "") return "—";
      const d = new Date(value);
      return isValid(d) ? format(d, "yyyy-MM-dd") : "—";
    },
  },
  {
    field: "action",
    headerName: "Actions",
    minWidth: 140,
    flex: 0.9,
    sortable: false,
    renderCell: (params: any) => <ActionCell {...params} />,
  },
];

export default function CompanySalesList() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.GetAllSale);
  const { canCreate } = useCompanyPermissions();
  const delSaleState = useSelector((state: RootState) => state.DeleteSale);
  const [searchInput, setSearchInput] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 20 });

  React.useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const stats = React.useMemo(() => {
    const list = state.data ?? [];
    return {
      totalSales: state.total ?? 0,
      totalReceived: list.reduce((sum, s) => sum + parseFloat(s.received_amount || "0"), 0),
      totalQty: list.reduce((sum, s) => sum + parseFloat(String(s.sale_qty ?? 0).replace(',', '.')), 0),
      pageCount: list.length,
    };
  }, [state.data, state.total]);

  React.useEffect(() => {
    dispatch(
      getAllSaleListFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      })
    );
  }, [dispatch, paginationModel.page, paginationModel.pageSize, searchQuery]);

  React.useEffect(() => {
    if (delSaleState.isSuccess) {
      toast.success("Sale deleted successfully");
      dispatch(resetDelSale());
    }
    if (delSaleState.isError) {
      toast.error(delSaleState.errorMsg || "Error deleting sale");
      dispatch(resetDelSale());
    }
  }, [delSaleState, dispatch]);

  React.useEffect(() => {
    if (state.isLoading) {
      toast.loading("Loading...", { id: "sales-toast" });
    } else {
      toast.dismiss("sales-toast");
    }
    if (state.isError) {
      toast.error(state.errorMsg || "Error loading sales", { id: "sales-toast" });
      dispatch(resetAllSales());
    }
  }, [state.isLoading, state.isError, state.errorMsg, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-auto">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <HiOutlineShoppingCart className="text-xl" />
              </span>
            Company Sales
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            View and manage your company sales
          </p>
          </div>
          {canCreate('sales') && (
            <Link
              to="/Dashboard/Sales/Create"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/30 transition-all text-sm shrink-0"
            >
              <HiOutlinePlus className="text-lg" />
              Create Sale
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <HiOutlineCube className="text-2xl" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Sales</p>
              <p className="text-xl font-bold text-slate-800">{stats.totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <HiOutlineCurrencyDollar className="text-2xl" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Received</p>
              <p className="text-xl font-bold text-slate-800">
                ${stats.totalReceived.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
              <HiOutlineShoppingCart className="text-2xl" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Units</p>
              <p className="text-xl font-bold text-slate-800">{stats.totalQty.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-200/60 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Company sales</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stats.pageCount > 0
                  ? `Showing ${stats.pageCount} of ${state.total ?? 0} records`
                  : "No sales yet."}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto sm:min-w-[280px]">
              <input
                type="text"
                placeholder="Search product, sold by, sale ID..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPaginationModel((p) => ({ ...p, page: 0 }));
                }}
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setPaginationModel((p) => ({ ...p, page: 0 }));
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="p-2 sm:p-4 overflow-x-auto">
            <Box sx={{ width: "100%", minWidth: 700 }}>
              <DataGrid
                key={`sales-${state.isSuccess ? "loaded" : "loading"}`}
                autoHeight
                rows={(state.data ?? []).map((r) => ({ id: r.sale_id, ...r }))}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 20, 30, 50]}
                rowCount={state.total ?? 0}
                paginationMode="server"
                loading={state.isLoading}
                checkboxSelection
                disableRowSelectionOnClick
                rowHeight={52}
                sx={{
                  border: "none",
                  fontSize: "0.875rem",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f8fafc",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#64748b",
                    minHeight: "48px !important",
                    maxHeight: "48px !important",
                  },
                  "& .MuiDataGrid-row": {
                    borderBottom: "1px solid #f1f5f9",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#f8fafc",
                  },
                  "& .MuiDataGrid-cell": {
                    py: 1,
                    padding: "8px 12px",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                    minHeight: 52,
                  },
                  "& .MuiDataGrid-checkboxInput": {
                    width: 18,
                    height: 18,
                    transform: "scale(0.85)",
                  },
                }}
              />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

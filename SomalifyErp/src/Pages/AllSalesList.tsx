"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store";
import { Link } from "react-router-dom";
import { getAllSaleListFn } from "@/Redux/Slice/AllSalesSlice";
import { delSaleFn, resetDelSale } from "@/Redux/Slice/DeleteSale";
import axios from "axios";
import { Url } from "@/Interfaces";
import { CompanyFilter } from "@/components/ui/CompanyFilter";
import SideParsm from "@/components/SideParsm";
import toast from "react-hot-toast";
import { format, isValid } from "date-fns";
import { HiOutlineShoppingCart, HiOutlineCurrencyDollar, HiOutlineCube } from "react-icons/hi2";

// ================= ACTION CELL =================
const ActionCell = (params: any) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <span onClick={handleClick} style={{ cursor: "pointer" }}>
        <MoreVertIcon sx={{ color: "#6b7280" }} />
      </span>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ style: { maxHeight: 48 * 4.5, width: "18ch", borderRadius: 8 } }}
      >
        <Link to={`/AdminDashboard/Sales/Update/${params.row.sale_id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <MenuItem>Update</MenuItem>
        </Link>
        <MenuItem onClick={() => dispatch(delSaleFn(params.row.sale_id))} sx={{ color: "red" }}>
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

// ================= BUILD COLUMNS =================
const getColumns = (): GridColDef[] => [
  {
    field: "company_name",
    headerName: "Company",
    width: 180,
    renderCell: (params: any) =>
      params.row.company_name ||
      params.row.product_purchases?.vendors?.companies?.company_name ||
      params.row.company_users?.companies?.company_name ||
      "N/A",
  },
  { field: "sale_id", headerName: "ID", width: 100 },
  {
    field: "product_name",
    headerName: "Products",
    width: 240,
    renderCell: (params: any) =>
      params.row.product_name ||
      params.row.product_purchases?.products?.product_name ||
      params.row.warehouse_stock?.product?.product_name ||
      "N/A",
  },
  {
    field: "sale_qty",
    headerName: "Quantity",
    width: 100,
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
  { field: "item_price", headerName: "Price", width: 100 },
  { field: "sale_discount", headerName: "Discount", width: 100 },
  { field: "received_amount", headerName: "Received", width: 120 },
  {
    field: "sold_by",
    headerName: "Sold By",
    width: 200,
    renderCell: (params: any) => params.row.company_users?.full_name || "System",
  },
  {
    field: "created_at",
    headerName: "Created Date",
    width: 200,
    valueFormatter: (value: any) => {
      if (!value) return "";
      const d = new Date(value);
      return isValid(d) ? format(d, "yyyy-MM-dd") : "";
    },
  },
  {
    field: "action",
    headerName: "Action",
    width: 100,
    sortable: false,
    renderCell: (params: any) => <ActionCell {...params} />,
  },
];

// ================= ALL SALES LIST PAGE =================
export default function AllSalesList() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.GetAllSale);
  const delSaleState = useSelector((state: RootState) => state.DeleteSale);

  const [selectedCompanyId, setSelectedCompanyId] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 20 });
  const [stats, setStats] = React.useState({ totalSales: 0, totalReceived: 0, totalQty: 0 });

  React.useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadStats = React.useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const headers: Record<string, string> = {};
      if (userInfo.accessToken) headers.Authorization = `Bearer ${userInfo.accessToken}`;
      const res = await axios.get(`${Url}/sales`, {
        params: {
          page: 1,
          pageSize: 1000,
          ...(selectedCompanyId && { company_id: selectedCompanyId }),
        },
        headers,
        withCredentials: true,
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setStats({
        totalSales: res.data?.total ?? list.length,
        totalReceived: list.reduce((sum: number, s: { received_amount?: string }) => sum + parseFloat(s.received_amount || "0"), 0),
        totalQty: list.reduce((sum: number, s: { sale_qty?: string | number }) => sum + parseFloat(String(s.sale_qty ?? 0).replace(",", ".")), 0),
      });
    } catch {
      /* keep last stats */
    }
  }, [selectedCompanyId]);

  React.useEffect(() => {
    loadStats();
  }, [loadStats]);

  const pageCount = state.data?.length ?? 0;

  React.useEffect(() => {
    dispatch(
      getAllSaleListFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        ...(selectedCompanyId && { company_id: selectedCompanyId }),
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      })
    );
  }, [dispatch, paginationModel.page, paginationModel.pageSize, selectedCompanyId, searchQuery]);

  React.useEffect(() => {
    if (delSaleState.isSuccess) {
      toast.success("Sale deleted successfully");
      dispatch(resetDelSale());
      loadStats();
    }
    if (delSaleState.isError) {
      toast.error(delSaleState.errorMsg || "Error deleting sale");
      dispatch(resetDelSale());
    }
  }, [delSaleState, dispatch, loadStats]);

  React.useEffect(() => {
    if (state.isLoading) toast.loading("Loading...", { id: "sales-toast" });
    else toast.dismiss("sales-toast");
    if (state.isError) {
      toast.error(state.errorMsg || "Error loading sales", { id: "sales-toast" });
    }
  }, [state.isLoading, state.isError, state.errorMsg]);

  const columns = React.useMemo(() => getColumns(), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200/80">
        <div className="lg:hidden">
          <SideParsm />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <HiOutlineShoppingCart className="text-xl" />
              </span>
              All Sales List
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              View all sales from all companies
            </p>
          </div>
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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/60 bg-slate-50/50 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">
                  All sales (all companies)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {pageCount > 0
                    ? `Showing ${pageCount} records · ${stats.totalSales} total`
                    : "No sales yet."}
                </p>
              </div>
              <CompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by product, customer, sold by, or sale ID..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPaginationModel((p) => ({ ...p, page: 0 }));
                }}
                className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setPaginationModel((p) => ({ ...p, page: 0 }));
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="p-4">
            <Box sx={{ width: "100%" }}>
              <DataGrid
                autoHeight
                rows={(state.data ?? []).map((r) => ({ id: r.sale_id, ...r }))}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[20, 30, 50]}
                rowCount={state.total ?? 0}
                paginationMode="server"
                loading={state.isLoading}
                checkboxSelection
                sx={{
                  border: "none",
                  fontSize: "0.85rem",
                  "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9fafb", fontWeight: 600 },
                  "& .MuiDataGrid-row": { borderBottom: "1px solid #f1f5f9" },
                  "& .MuiDataGrid-row:hover": { backgroundColor: "#f9fafb" },
                  "& .MuiDataGrid-cell": { py: 0.5, padding: "4px 8px" },
                  "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #e5e7eb" },
                }}
              />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

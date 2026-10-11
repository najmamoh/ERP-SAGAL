import { AppDispatch, RootState } from "@/Redux/Store";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  CompanyExpenseItem,
  getCompanyExpensesFn,
  resetCompanyExpenses,
} from "@/Redux/Slice/expenses/CompanyExpensesSlice";
import { delExpensesFn, resetExpensesDelete } from "@/Redux/Slice/expenses/DeleteExpensesSlice";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

function CompanyExpenseActionCell({ row }: { row: CompanyExpenseItem & { id: number } }) {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      dispatch(delExpensesFn(row.expense_id));
      dispatch(resetExpensesDelete());
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to={`/Dashboard/Products/Expenses/Update/${row.expense_id}`}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <FiEdit2 className="w-3.5 h-3.5" />
        Update
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
}

const getColumns = (): GridColDef[] => [
  {
    field: "index",
    headerName: "#",
    width: 56,
    minWidth: 56,
    sortable: false,
    renderCell: (params) => {
      const page = params.api.state.pagination.paginationModel.page;
      const pageSize = params.api.state.pagination.paginationModel.pageSize;
      const rowIndex =
        page * pageSize + params.api.getAllRowIds().indexOf(params.id) + 1;
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs">
          {rowIndex}
        </span>
      );
    },
  },
  { field: "expense_id", headerName: "ID", width: 70, minWidth: 60 },
  { field: "item_name", headerName: "Item Name", flex: 1, minWidth: 140 },
  { field: "item_qty", headerName: "Qty", width: 80, minWidth: 70 },
  {
    field: "item_cost",
    headerName: "Item Cost",
    width: 110,
    minWidth: 95,
    renderCell: (params) => (
      <span className="tabular-nums text-slate-700">
        ${parseFloat(String(params.value || 0)).toFixed(2)}
      </span>
    ),
  },
  {
    field: "total_cost",
    headerName: "Total",
    width: 110,
    minWidth: 95,
    renderCell: (params) => (
      <span className="font-semibold text-slate-800 tabular-nums">
        ${parseFloat(String(params.value || 0)).toFixed(2)}
      </span>
    ),
  },
  {
    field: "paid_amount",
    headerName: "Paid",
    width: 110,
    minWidth: 95,
    renderCell: (params) => (
      <span className="tabular-nums text-emerald-700 font-medium">
        ${parseFloat(String(params.value || 0)).toFixed(2)}
      </span>
    ),
  },
  {
    field: "date",
    headerName: "Date",
    width: 115,
    minWidth: 100,
    valueFormatter: (value: any) => {
      if (value == null || value === "") return "—";
      const d = new Date(value as string);
      return Number.isNaN(d.getTime()) ? String(value) : format(d, "yyyy-MM-dd");
    },
  },
  {
    field: "action",
    headerName: "Actions",
    width: 140,
    minWidth: 130,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => <CompanyExpenseActionCell row={params.row as CompanyExpenseItem & { id: number }} />,
  },
];

export default function CompanyExpensesData() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const companyExpensesState = useSelector(
    (state: RootState) => state.CompanyExpenses
  );
  const deleteState = useSelector((state: RootState) => state.DelExpenses);

  const columns = getColumns();

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    dispatch(
      getCompanyExpensesFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      })
    );
  }, [dispatch, paginationModel.page, paginationModel.pageSize, searchQuery]);

  useEffect(() => {
    if (companyExpensesState.isLoading) toast.loading("Loading...", { id: "company-exp" });
    else toast.dismiss("company-exp");
    if (companyExpensesState.isError) {
      toast.error(companyExpensesState.errorMsg, { id: "company-exp" });
      dispatch(resetCompanyExpenses());
    }
  }, [companyExpensesState.isLoading, companyExpensesState.isError, dispatch]);

  useEffect(() => {
    if (deleteState.isLoading) toast.loading("Deleting...", { id: "company-exp-del" });
    if (deleteState.isSuccess) {
      toast.success("Expense deleted", { id: "company-exp-del" });
      navigate("/Dashboard/CompanyExpenses");
      dispatch(resetExpensesDelete());
      dispatch(getCompanyExpensesFn({ page: 1, pageSize: paginationModel.pageSize }));
    }
    if (deleteState.isError) {
      toast.error(deleteState.errorMsg, { id: "company-exp-del" });
      dispatch(resetExpensesDelete());
    }
  }, [deleteState.isLoading, deleteState.isSuccess, deleteState.isError, deleteState.errorMsg, dispatch, navigate, paginationModel.pageSize]);

  const safeFormatDate = (value: unknown) => {
    if (value == null || value === "") return "—";
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? String(value) : format(d, "yyyy-MM-dd");
  };

  const rawData = Array.isArray(companyExpensesState.data) ? companyExpensesState.data : [];
  const rows = rawData.map((expense: CompanyExpenseItem) => ({
    id: expense.expense_id,
    ...expense,
    total_cost: parseFloat(expense.item_cost || "0") * expense.item_qty,
    date: safeFormatDate(expense.date),
  }));

  return (
    <Box className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {companyExpensesState.total > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-blue-50 dark:bg-indigo-900/20 border border-indigo-200/60 dark:border-indigo-500/20 px-4 py-2.5 shrink-0">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total expenses</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums ml-2">
              {companyExpensesState.total.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex gap-2 flex-1 sm:max-w-sm">
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPaginationModel((p) => ({ ...p, page: 0 }));
            }}
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
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
      <DataGrid
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        rowCount={companyExpensesState.total}
        loading={companyExpensesState.isLoading}
        checkboxSelection
        paginationMode="server"
        disableRowSelectionOnClick
        rowHeight={52}
        sx={{
          border: "none",
          fontSize: "0.875rem",
          "& .MuiDataGrid-main": { borderRadius: 12 },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8fafc",
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#64748b",
            borderBottom: "2px solid #e2e8f0",
            minHeight: "48px !important",
            maxHeight: "48px !important",
          },
          "& .MuiDataGrid-row": { borderBottom: "1px solid #f1f5f9" },
          "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" },
          "& .MuiDataGrid-cell": { py: 1.25, padding: "8px 16px" },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "2px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            minHeight: 52,
          },
          "& .MuiDataGrid-checkboxInput": {
            width: 18,
            height: 18,
            padding: 0,
            transform: "scale(0.85)",
          },
        }}
      />
    </Box>
  );
}

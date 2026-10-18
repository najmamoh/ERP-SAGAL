import { AppDispatch, RootState } from "@/Redux/Store";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  getCompanyExpensesFn,
  resetCompanyExpenses,
  CompanyExpenseItem,
} from "@/Redux/Slice/expenses/CompanyExpensesSlice";
import { delExpensesFn, resetExpensesDelete } from "@/Redux/Slice/expenses/DeleteExpensesSlice";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TableSearch, { useDebouncedValue } from "@/components/ui/TableSearch";

const basePath = "/AdminDashboard";

const columns: GridColDef[] = [
  { field: "expense_id", headerName: "ID", width: 90 },
  {
    field: "company_name",
    headerName: "Company",
    width: 160,
    renderCell: (params: any) =>
      params.row.companies?.company_name ?? params.row.company_id ?? "N/A",
  },
  { field: "item_name", headerName: "Item Name", width: 180 },
  { field: "item_qty", headerName: "Qty", width: 100 },
  { field: "item_cost", headerName: "Item Cost", width: 130 },
  { field: "total_cost", headerName: "Total", width: 130 },
  { field: "paid_amount", headerName: "Paid", width: 130 },
  {
    field: "date",
    headerName: "Date",
    width: 130,
    valueFormatter: (value: any) =>
      value ? format(new Date(value), "yyyy-MM-dd") : "",
  },
  {
    field: "action",
    headerName: "Action",
    width: 90,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => <ActionCell {...params} />,
  },
];

function ActionCell(params: any) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = () => {
    dispatch(delExpensesFn(params.row.expense_id));
    dispatch(resetExpensesDelete());
    setAnchorEl(null);
  };
  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{ color: "#9ca3af", "&:hover": { color: "#374151" } }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <Link
          to={`${basePath}/Products/Expenses/Update/${params.row.expense_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <MenuItem>Update</MenuItem>
        </Link>
        <MenuItem onClick={handleDelete} sx={{ color: "red" }}>Delete</MenuItem>
      </Menu>
    </>
  );
}

interface AdminExpensesDataProps {
  selectedCompanyId: string;
  startDate: string;
  endDate: string;
}

export default function AdminExpensesData({
  selectedCompanyId,
  startDate,
  endDate,
}: AdminExpensesDataProps) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const ExpensesState = useSelector(
    (state: RootState) => state.CompanyExpenses
  );
  const DeleteExpensestate = useSelector(
    (state: RootState) => state.DelExpenses
  );

  useEffect(() => {
    dispatch(
      getCompanyExpensesFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        ...(selectedCompanyId && { company_id: selectedCompanyId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        search,
      })
    );
  }, [
    dispatch,
    paginationModel.page,
    paginationModel.pageSize,
    selectedCompanyId,
    startDate,
    endDate,
    search,
  ]);

  useEffect(() => {
    if (ExpensesState.isError) {
      toast.error(ExpensesState.errorMsg, { id: "expenses-load" });
      dispatch(resetCompanyExpenses());
    }
  }, [ExpensesState.isError, dispatch]);

  useEffect(() => {
    if (DeleteExpensestate.isLoading)
      toast.loading("Deleting!", { id: "del" });
    if (DeleteExpensestate.isSuccess) {
      toast.success("Expense deleted", { id: "del" });
      navigate(`${basePath}/Expenses`);
    }
    if (DeleteExpensestate.isError)
      toast.error(DeleteExpensestate.errorMsg, { id: "del" });
    dispatch(resetExpensesDelete());
  }, [DeleteExpensestate, dispatch, navigate]);

  const data = Array.isArray(ExpensesState.data) ? ExpensesState.data : [];

  const rows = data.map((expense: CompanyExpenseItem) => ({
    id: expense.expense_id,
    ...expense,
    total_cost: parseFloat(expense.item_cost || "0") * expense.item_qty,
    date: expense.date,
  }));

  return (
    <Box className="w-full">
      <TableSearch value={searchInput} onChange={(v) => { setSearchInput(v); setPaginationModel((p) => ({ ...p, page: 0 })); }} placeholder="Search expenses..." />
      <DataGrid
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[20, 30, 50]}
        rowCount={ExpensesState.total}
        checkboxSelection
        paginationMode="server"
        loading={ExpensesState.isLoading}
        disableRowSelectionOnClick
        rowHeight={52}
        sx={{
          border: "none",
          fontSize: "0.85rem",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f9fafb",
            fontWeight: 600,
            fontSize: "0.875rem",
          },
          "& .MuiDataGrid-row": { borderBottom: "1px solid #f1f5f9" },
          "& .MuiDataGrid-row:hover": { backgroundColor: "#f9fafb" },
          "& .MuiDataGrid-cell": { py: 0.5, padding: "4px 8px" },
          "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #e5e7eb" },
          "& .MuiDataGrid-checkboxInput": {
            width: 14,
            height: 14,
            padding: 0,
            transform: "scale(0.8)",
          },
        }}
      />
    </Box>
  );
}

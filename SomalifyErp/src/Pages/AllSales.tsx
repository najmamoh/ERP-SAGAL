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
import { getAllSaleListFn, resetAllSales } from "@/Redux/Slice/AllSalesSlice";
import { delSaleFn, resetDelSale } from "@/Redux/Slice/DeleteSale";
import toast from "react-hot-toast";
import { format } from "date-fns";

// ================= ACTION CELL =================
export const ActionCell = (params: any) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = (event: any) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // const handleDeleteClick = () => {
  //   setIsDeleteOpen(true);
  //   handleClose();
  // };

  return (
    <div>
      <MoreVertIcon
        onClick={handleClick}
        sx={{ cursor: "pointer", color: "#6b7280" }}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { maxHeight: 48 * 4.5, width: "18ch", borderRadius: 8 },
        }}
      >
        <Link
          to={`/Dashboard/Sales/Update/${params.row.sale_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <MenuItem>Update</MenuItem>
        </Link>
        <MenuItem onClick={() => dispatch(delSaleFn(params.row.sale_id))} sx={{ color: "red" }}>
          Delete
        </MenuItem>
        <MenuItem onClick={() => console.log("More")}>More</MenuItem>
      </Menu>
    </div>
  );
};

// ================= COLUMNS =================
const columns: GridColDef[] = [
  { field: "sale_id", headerName: "ID", width: 100 },
  {
    field: "product_name",
    headerName: "Product Name",
    width: 200,
    renderCell: (params) =>
      params.row.product_purchases?.products?.product_name || "N/A",
  },
  {
    field: "sale_qty",
    headerName: "Quantity",
    width: 100,
    valueFormatter: (value: any) => {
      const n = parseFloat(String(value ?? 0).replace(',', '.'));
      return Number.isNaN(n) ? '0' : String(n);
    },
  },
  { field: "item_price", headerName: "Price", width: 100 },
  { field: "sale_discount", headerName: "Discount", width: 100 },
  { field: "received_amount", headerName: "Received", width: 120 },
  {
    field: "sold_by",
    headerName: "Sold By",
    width: 200,
    renderCell: (params) => params.row.company_users?.full_name || "System",
  },
  {
    field: "created_at",
    headerName: "Created Date",
    width: 200,
    valueFormatter: (value: any) => (value ? format(new Date(value), "yyyy-MM-dd") : ""),
  },
  // {
  //   field: "updated_at",
  //   headerName: "Updated Date",
  //   width: 200,
  //   valueFormatter: (value: any) => (value ? format(new Date(value), "yyyy-MM-dd") : ""),
  // },
  {
    field: "action",
    headerName: "Action",
    width: 100,
    sortable: false,
    renderCell: (params) => <ActionCell {...params} />,
  },
];

// ================= SALE LIST DATA GRID =================
export default function SaleListData() {
  const dispatch = useDispatch<AppDispatch>();
  const AllSaleState = useSelector((state: RootState) => state.GetAllSale);
  const delSaleState = useSelector((state: RootState) => state.DeleteSale);

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 20,
  });

  React.useEffect(() => {
    dispatch(
      getAllSaleListFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      })
    );
  }, [dispatch, paginationModel]);

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

  const toastId = "toastw";
  React.useEffect(() => {
    if (AllSaleState.isLoading)
      toast.loading("Loading...", { id: toastId });
    if (AllSaleState.isError)
      toast.error(AllSaleState.errorMsg || "Error loading sales", {
        id: toastId,
      });
    dispatch(resetAllSales());
  }, [AllSaleState.isLoading, AllSaleState.isError, dispatch]);

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        autoHeight
        rows={AllSaleState.data.map((vendor) => ({
          id: vendor.sale_id,
          ...vendor,
        }))}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[20, 30, 50]}
        rowCount={AllSaleState.total}
        paginationMode="server"
        checkboxSelection
        sx={{
          border: "none",
          fontSize: "0.85rem",

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f9fafb",
            fontWeight: 600,
            fontSize: "0.875rem",
          },

          "& .MuiDataGrid-row": {
            borderBottom: "1px solid #f1f5f9",
          },

          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f9fafb",
          },

          "& .MuiDataGrid-cell": {
            py: 0.5,
            padding: "4px 8px", // cells compact

          },

          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e5e7eb",
          },

          "& .MuiDataGrid-checkboxInput": {
            width: 14,
            height: 14,
            padding: 0,
            transform: "scale(0.8)", // checkbox-ka yar
          },
         
        }}
      />
    </Box>
  );
}

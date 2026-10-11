"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store";
import { getAllTransactionsFn } from "@/Redux/Slice/GetAllTransactions";

/* ---------------- COLUMNS ---------------- */
const columns: GridColDef[] = [
  {
    field: "company_name",
    headerName: "Company Name",
    flex: 2,
    minWidth: 150,
    valueGetter: (params: any) =>
      params.row?.treasury?.name ?? params.row?.name ?? "",
  },
  {
    field: "amount",
    headerName: "Amount",
    flex: 1,  // yar
    minWidth: 100,
  },
  {
    field: "currency_type",
    headerName: "Currency",
    flex: 1,  // yar
    minWidth: 80,
  },
  {
    field: "created_at",
    headerName: "Date",
    flex: 1.5,  // ka weyn Amount iyo Currency
    minWidth: 150,
    valueFormatter: (value: any) =>
      value ? new Date(value).toLocaleString() : "",
  },
];


/* ---------------- TYPES ---------------- */
interface TransactionsDataGridProps {
  slots?: {
    toolbar?: () => JSX.Element;
  };
}

export default function TransactionsDataGrid({ slots }: TransactionsDataGridProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { data = [], total = 0, isLoading = false } =
    useSelector((state: RootState) => state.AllTransactions) ?? {};

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  React.useEffect(() => {
    dispatch(
      getAllTransactionsFn({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      })
    );
  }, [dispatch, paginationModel]);

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        autoHeight
        rows={data}
        columns={columns}
        getRowId={(row) => row.transaction_id}
        rowCount={total}
        loading={isLoading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 30]}
        checkboxSelection
        onRowSelectionModelChange={(ids) => setSelectedRows(ids as string[])}
        rowSelectionModel={selectedRows}
        rowHeight={45} // height yar oo compact
        getRowSpacing={() => ({
          top: 5,
          bottom: 5,
        })}
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
        slots={slots}
      />

      {/* Optional: show selected rows count */}
      <Box sx={{ mt: 2 }}>
        <strong>Selected Rows:</strong> {selectedRows.length}
      </Box>
    </Box>
  );
}

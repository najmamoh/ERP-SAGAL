"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { AppDispatch, RootState } from "@/Redux/Store";
import {
  getAllTreasuriesFn,
  getTreasuryBalanceFn,
  confirmTransferFn,
  cancelTransferFn,
} from "@/Redux/Slice/TreasurySlice";
import { format } from "date-fns";
import TableSearch, { useDebouncedValue } from "@/components/ui/TableSearch";

export type TransferFilterType = "all" | "sent" | "received";

const PENDING = "PENDING";

const statusConfig: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-red-50", text: "text-red-700" },
  CONFIRMED: { bg: "bg-green-50", text: "text-green-700" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700" },
  CANCELLED: { bg: "bg-slate-50", text: "text-slate-600" },
};

interface TreasuryTableProps {
  transferFilter?: TransferFilterType;
  selectedCompanyId?: string;
}

export default function TreasuryTable({ transferFilter = "all", selectedCompanyId }: TreasuryTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith("/AdminDashboard");
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const roles = userInfo?.user?.roles || userInfo?.roles || [];
  const isAdmin = roles.includes("admin") || roles.includes("superAdmin") || roles.includes("super_admin");

  const { treasuries = [], isLoading = false } =
    useSelector((state: RootState) => state.treasury) ?? {};

  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebouncedValue(searchInput);

  const fetchParams = React.useMemo((): { type?: "sent" | "received"; company_id?: string; search?: string } | undefined => {
    const p: { type?: "sent" | "received"; company_id?: string; search?: string } =
      transferFilter !== "all" ? { type: transferFilter } : {};
    if (selectedCompanyId) p.company_id = selectedCompanyId;
    if (search.trim()) p.search = search.trim();
    return Object.keys(p).length ? p : undefined;
  }, [transferFilter, selectedCompanyId, search]);

  const handleConfirm = React.useCallback(
    async (id: string) => {
      setActionId(id);
      const result = await dispatch(confirmTransferFn(id));
      setActionId(null);
      if (confirmTransferFn.fulfilled.match(result)) {
        toast.success("Transfer confirmed");
        dispatch(getAllTreasuriesFn(fetchParams));
        dispatch(getTreasuryBalanceFn());
      } else {
        toast.error(typeof result.payload === "string" ? result.payload : "Failed to confirm");
      }
    },
    [dispatch, fetchParams]
  );

  const handleCancel = React.useCallback(
    async (id: string) => {
      setActionId(id);
      const result = await dispatch(cancelTransferFn(id));
      setActionId(null);
      if (cancelTransferFn.fulfilled.match(result)) {
        toast.success("Transfer cancelled");
        dispatch(getAllTreasuriesFn(fetchParams));
        dispatch(getTreasuryBalanceFn());
      } else {
        toast.error(typeof result.payload === "string" ? result.payload : "Failed to cancel");
      }
    },
    [dispatch, fetchParams]
  );

  const canConfirmTransfer = React.useCallback(
    (row: { status: string }) => {
      if (row.status !== PENDING) return false;
      // Only main admin dashboard can approve transfers
      return isAdminDashboard && isAdmin;
    },
    [isAdminDashboard, isAdmin]
  );

  const handleBulkConfirm = React.useCallback(async () => {
    const rows = treasuries.filter((r: any) => selectedRows.includes(r.id) && canConfirmTransfer(r));
    if (rows.length === 0) {
      toast.error("No confirmable transfers selected");
      return;
    }
    setActionId("bulk");
    let ok = 0;
    let fail = 0;
    for (const row of rows) {
      const result = await dispatch(confirmTransferFn(row.id));
      if (confirmTransferFn.fulfilled.match(result)) ok++;
      else fail++;
    }
    setActionId(null);
    setSelectedRows([]);
    if (ok) {
      toast.success(`Confirmed ${ok} transfer${ok > 1 ? "s" : ""}`);
      dispatch(getAllTreasuriesFn(fetchParams));
      dispatch(getTreasuryBalanceFn());
    }
    if (fail) toast.error(`Failed to confirm ${fail} transfer${fail > 1 ? "s" : ""}`);
  }, [selectedRows, treasuries, canConfirmTransfer, dispatch, fetchParams]);

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: "index",
        headerName: "#",
        width: 50,
        minWidth: 50,
        sortable: false,
        renderCell: (params: any) => {
          if (!params?.api) return null;
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
      {
        field: "type_badge",
        headerName: "Type",
        width: 110,
        minWidth: 110,
        sortable: false,
        renderCell: (params: any) => {
          const ref: string = params?.row?.reference_id ?? "";
          const isWithdrawal = ref.startsWith("WDR-");
          return isWithdrawal ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              ↓ Withdrawal
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              ↑ Deposit
            </span>
          );
        },
      },
      {
        field: "reference_id",
        headerName: "Reference",
        flex: 1,
        minWidth: 130,
      },
      {
        field: "amount",
        headerName: "Amount (USD)",
        flex: 1,
        minWidth: 110,
        renderCell: (params: any) => {
          const ref: string = params?.row?.reference_id ?? "";
          const isWithdrawal = ref.startsWith("WDR-");
          return (
            <span className={`font-bold tabular-nums text-sm ${isWithdrawal ? "text-amber-600" : "text-indigo-700"}`}>
              {isWithdrawal ? "−" : "+"}${params?.value != null ? Number(params.value).toFixed(2) : "0.00"}
            </span>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 100,
        minWidth: 100,
        renderCell: (params: any) => {
          const status = String(params?.value ?? "").toUpperCase();
          const config = statusConfig[status] || statusConfig.PENDING;
          return (
            <span
              className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.text}`}
            >
              {params?.value ?? "—"}
            </span>
          );
        },
      },
      {
        field: "sender",
        headerName: "From",
        flex: 1.2,
        minWidth: 120,
        renderCell: (params: any) => {
          const ref: string = params?.row?.reference_id ?? "";
          const isWithdrawal = ref.startsWith("WDR-");
          const name = params?.row?.sender?.company_name ?? "—";
          return (
            <span className={`text-sm font-medium ${isWithdrawal ? "text-amber-700" : "text-slate-700"}`}>
              {isWithdrawal ? "🏦 Bank" : name}
            </span>
          );
        },
      },
      {
        field: "receiver_branch",
        headerName: "To",
        flex: 1.2,
        minWidth: 120,
        renderCell: (params: any) => {
          if (!params?.row) return <span className="text-slate-400">—</span>;
          const ref: string = params.row.reference_id ?? "";
          const isWithdrawal = ref.startsWith("WDR-");
          if (isWithdrawal) {
            // For withdrawals: money goes TO the requesting company (sender)
            const name = params.row.sender?.company_name ?? "—";
            return (
              <span className="text-sm font-medium text-amber-700">🏢 {name}</span>
            );
          }
          // Normal deposit: money goes to bank
          return (
            <span className="text-sm font-medium text-indigo-700">🏦 Bank</span>
          );
        },
      },
      {
        field: "created_at",
        headerName: "Date",
        flex: 1,
        minWidth: 120,
        valueFormatter: (value: any) => {
          return value ? format(new Date(value as string), "yyyy-MM-dd") : "—";
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.2,
        minWidth: 180,
        sortable: false,
        renderCell: (params: any) => {
          const row = params?.row;
          if (!row) return null;
          if (row.status !== PENDING) {
            return (
              <span className="text-slate-400 text-sm">{row.status}</span>
            );
          }
          const canConfirm = canConfirmTransfer(row);
          const loading = actionId === row.id || actionId === "bulk";
          const isWithdrawal = String(row.reference_id ?? "").startsWith("WDR-");
          return (
            <div className="flex items-center gap-1.5">
              {canConfirm && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirm(row.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50 ${
                    isWithdrawal
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {loading ? "..." : isWithdrawal ? "Approve" : "Confirm"}
                </button>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(row.id);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          );
        },
      },
    ],
    [canConfirmTransfer, handleConfirm, handleCancel, actionId]
  );

  React.useEffect(() => {
    dispatch(getAllTreasuriesFn(fetchParams));
  }, [dispatch, fetchParams]);

  React.useEffect(() => {
    if (isLoading) toast.loading("Loading...", { id: "treasury-toast" });
    else toast.dismiss("treasury-toast");
  }, [isLoading]);

  const selectedConfirmable = treasuries.filter(
    (r: any) => selectedRows.includes(r.id) && canConfirmTransfer(r)
  );

  return (
    <Box sx={{ width: "100%" }}>
      <TableSearch value={searchInput} onChange={setSearchInput} placeholder="Search treasury..." />
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-3 mb-3">
          <p className="text-sm text-slate-500">
            {selectedRows.length} selected
            {selectedConfirmable.length > 0 && ` (${selectedConfirmable.length} can be confirmed)`}
          </p>
          {selectedConfirmable.length > 0 && (
            <button
              type="button"
              disabled={actionId === "bulk"}
              onClick={handleBulkConfirm}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {actionId === "bulk" ? "Confirming..." : `Confirm ${selectedConfirmable.length}`}
            </button>
          )}
        </div>
      )}
      <DataGrid
        autoHeight
        rows={treasuries}
        columns={columns}
        getRowId={(row) => row.id}
        loading={isLoading}
        pageSizeOptions={[10, 20, 30]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        checkboxSelection
        onRowSelectionModelChange={(ids) => setSelectedRows(ids as string[])}
        rowSelectionModel={selectedRows}
        rowHeight={48}
        getRowClassName={(params) =>
          String(params.row?.reference_id ?? "").startsWith("WDR-")
            ? "withdrawal-row"
            : "deposit-row"
        }
        sx={{
          border: "none",
          fontSize: "0.875rem",
          "& .MuiDataGrid-main": { borderRadius: 12 },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f1f5f9",
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#475569",
            borderBottom: "2px solid #e2e8f0",
            minHeight: "48px !important",
            maxHeight: "48px !important",
          },
          "& .MuiDataGrid-row": { borderBottom: "1px solid #f1f5f9" },
          "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" },
          "& .withdrawal-row": { backgroundColor: "#fffbeb" },
          "& .withdrawal-row:hover": { backgroundColor: "#fef3c7" },
          "& .deposit-row": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-cell": { py: 1.25, padding: "8px 16px" },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "2px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            minHeight: 52,
          },
          "& .MuiDataGrid-checkboxInput": {
            width: 16,
            height: 16,
            padding: 0,
            transform: "scale(0.9)",
          },
        }}
      />
    </Box>
  );
}

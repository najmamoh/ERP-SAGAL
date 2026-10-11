import { AppDispatch, RootState } from "@/Redux/Store";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  DataRespond,
  getAllPurchasesReportFn,
  setPagination,
} from "@/Redux/Slice/GetPurchasesReport";
import { Link, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { format } from "date-fns";
import { getOneCompanayFN } from "@/Redux/Slice/GetOneCompanaySlice";
import { CompanyFilter } from "@/components/ui/CompanyFilter";
import { motion } from "framer-motion";
import { FiShoppingCart, FiDollarSign, FiPackage } from "react-icons/fi";

function PurchaseReport() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes("/AdminDashboard");

  const dispatch = useDispatch<AppDispatch>();

  const GetAllPurchasesState = useSelector(
    (state: RootState) => state.GetPurchaseReport
  );
  const GetOneCompanayState = useSelector(
    (state: RootState) => state.GetOneCompanay
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(20);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("reportCompanyId") || "" : ""
  );

  useEffect(() => {
    dispatch(getOneCompanayFN());
  }, [dispatch]);

  const companyId = isAdminDashboard
    ? (selectedCompanyId || sessionStorage.getItem('reportCompanyId'))
    : (GetOneCompanayState.data?.company_id ?? JSON.parse(localStorage.getItem('userInfo') || '{}')?.user?.company_id ?? JSON.parse(localStorage.getItem('userInfo') || '{}')?.company_id);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate || !companyId) return;

    dispatch(
      getAllPurchasesReportFn({
        startDate,
        endDate,
        page: localPage,
        pageSize: localPageSize,
        company_id: companyId,
      })
    );
  };

  const handlePaginationChange = (pagination: any) => {
    const page = pagination.page + 1;
    setLocalPage(page);
    setLocalPageSize(pagination.pageSize);
    dispatch(
      setPagination({ page, pageSize: pagination.pageSize })
    );
  };

  const columns: GridColDef[] = [
    { field: "purchase_id", headerName: "ID", flex: 1 },
    { field: "product_name", headerName: "Product", flex: 1 },
    {
      field: "purchase_qty",
      headerName: "Qty",
      flex: 1,
      valueFormatter: (value: any) => {
        const n = parseFloat(String(value ?? 0).replace(',', '.'));
        return Number.isNaN(n) ? '0' : String(n);
      },
    },
    { field: "item_cost", headerName: "Item Cost", flex: 1 },
    { field: "purchase_discount", headerName: "Discount", flex: 1 },
    { field: "paid_amount", headerName: "Paid", flex: 1 },
    { field: "purchase_debt", headerName: "Debt", flex: 1 },
    {
      field: "expiry_date",
      headerName: "Expiry",
      width: 150,
      valueFormatter: (value: any) =>
        value ? format(new Date(value), "yyyy-MM-dd") : "",
    },
    {
      field: "manufacture_date",
      headerName: "Manufacture",
      width: 150,
      valueFormatter: (value: any) =>
        value ? format(new Date(value), "yyyy-MM-dd") : "",
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 150,
      valueFormatter: (value: any) =>
        value ? format(new Date(value), "yyyy-MM-dd") : "",
    },
  ];

  const PurchasesData =
    (GetAllPurchasesState.data || []).flatMap(
      (product: DataRespond) =>
        product.product_purchases.map((p) => ({
          ...p,
          product_name: product.product_name,
        }))
    );

  const Total = PurchasesData.reduce(
    (sum: number, p: any) =>
      sum + (p.item_cost * p.purchase_qty - p.purchase_discount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:bg-gray-900">
      {/* Sidebar */}

      {/* Back */}
      <Link
        to={
          isAdminDashboard
            ? "/AdminDashboard/Home"
            : "/Dashboard/Home"
        }
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="ml-4 mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-300"
        >
          <IoArrowBack /> Back
        </motion.button>
      </Link>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-600">
          Purchase Report
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {GetOneCompanayState.data?.company_name}
        </p>
      </div>

      {/* Filters */}
      <form
        onSubmit={submitHandler}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-3 rounded-lg border dark:bg-gray-700"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="p-3 rounded-lg border dark:bg-gray-700"
            required
          />
        </div>

        {isAdminDashboard && (
          <div className="mt-4">
            <CompanyFilter
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
          </div>
        )}

        <button
          type="submit"
          className="mt-4 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Get Purchase Report
        </button>
      </form>

      {/* Summary */}
      {PurchasesData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-6">
          <div className="bg-blue-600 text-white p-6 rounded-xl">
            <FiDollarSign />
            <h3 className="text-2xl font-bold">
              ${Total.toFixed(2)}
            </h3>
          </div>
          <div className="bg-teal-600 text-white p-6 rounded-xl">
            <FiPackage />
            <h3 className="text-2xl font-bold">
              {GetAllPurchasesState.total}
            </h3>
          </div>
          <div className="bg-purple-600 text-white p-6 rounded-xl">
            <FiShoppingCart />
            <h3 className="text-2xl font-bold">
              {PurchasesData.length}
            </h3>
          </div>
        </div>
      )}

      {/* Table */}
      {PurchasesData.length > 0 && (
        <div className="max-w-6xl mx-auto mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <Box>
            <DataGrid
              rows={PurchasesData.map((p: any) => ({
                id: p.purchase_id,
                ...p,
              }))}
              columns={columns}
              paginationMode="server"
              paginationModel={{
                page: localPage - 1,
                pageSize: localPageSize,
              }}
              rowCount={GetAllPurchasesState.total}
              pageSizeOptions={[10, 20, 50]}
              onPaginationModelChange={handlePaginationChange}
              loading={GetAllPurchasesState.isLoading}
              sx={{ border: "none" }}
            />
          </Box>
        </div>
      )}
    </div>
  );
}

export default PurchaseReport;

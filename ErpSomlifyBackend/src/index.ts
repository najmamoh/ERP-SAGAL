import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { AppRouter } from "./AppRouter";

// Load env ONCE
config();

// Routes
import AuthRoute from "./Routes/AuthRoute";
import VenderRoute from "./Routes/Vendor";
import ProductRoutes from "./Routes/ProductsRoute";
import PurchaseRoute from "./Routes/PurchaseRoute";
import saleRoutes from "./Routes/SaleRoute";
import CustomerRoute from "./Routes/customerRoute";
import EmployeesRoute from "./Routes/EmployeesRoute";
import SalaryRoute from "./Routes/salaryRoute";
import ExpensesRoute from "./Routes/AthorExpensesRoute";
import mainRoute from "./Routes/Mainroute";
import CompanyRoute from "./Routes/CompanyRoute";
import PayableRoute from "./Routes/PayAbleRoute";
import IncomeRoute from "./Routes/IncomeRoute";
import receivables from "./Routes/ReceiveableROute";
import MainReceivablesRoute from "./Routes/MainReceivablesRoute";
import InvoiceRoute from "./Routes/InvoiceRoute";
import MainInvoiceRoute from "./Routes/MainInvoiceRoute";
import ReportRoute from "./Routes/ReportRoute";
import PaidRoute from "./Routes/paidRoutes";
import jobsRoute from "./Routes/jobsRoute";
import serviceRoute from "./Routes/serviceRoute";
import ServiceSaleRoute from "./Routes/ServiceSaleRoute";
import BankingRoute from "./Routes/BankingRoute";
import TransferMoneyRoute from "./Routes/Transfer_MoneyRoute";
import TreasuryRoute from "./Routes/TreasuryRoute";
import RoleRoute from "./Routes/RoleRoute";
import PermissionRoute from "./Routes/PermissionRoute";
import WarehouseRoute from "./Routes/WarehouseRoute";
import StoreRoute from "./Routes/StoreRoute";
import BanksRoute from "./Routes/BanksRoute";
import SearchRoute from "./Routes/SearchRoute";

// Import controllers
import "./controllers";

const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Cookie parser MUST be before routes
app.use(cookieParser());

// CORS configuration with credentials support
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://newsagal.com",
      "https://www.newsagal.com",
      // "http://localhost:5173",
    ];

    // Allow Postman / server requests (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS MUST BE EARLY
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* Cookie Parser - MUST be before routes */

/* body parsers */
app.use(express.json());
app.use(bodyParser.json());

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

app.use(AppRouter.getIntance());

// ============================================
// API ROUTES
// ============================================
app.use("/api/auth", AuthRoute);
app.use("/api/vendors", VenderRoute);
app.use("/api/products", ProductRoutes);
app.use("/api/purchases", PurchaseRoute);
app.use("/api/sales", saleRoutes);
app.use("/api/customers", CustomerRoute);
app.use("/api/employees", EmployeesRoute);
app.use("/api/salaries", SalaryRoute);
app.use("/api/otherexpenses", ExpensesRoute);
app.use("/api/main/auth", mainRoute);
app.use("/api/companies", CompanyRoute);
app.use("/api/payables", PayableRoute);
app.use("/api/financial", IncomeRoute);
app.use("/api/receivables", receivables);
app.use("/api/main/receivables", MainReceivablesRoute);
app.use("/api/invoice", InvoiceRoute);
app.use("/api/main/invoice", MainInvoiceRoute);
app.use("/api/reports", ReportRoute);
app.use("/api/paid", PaidRoute);
app.use("/api/banking", BankingRoute);
app.use("/api/transfer-money", TransferMoneyRoute);
app.use("/api/treasury", TreasuryRoute);
app.use("/api/jobs", jobsRoute);
app.use("/api/service", serviceRoute);
app.use("/api/service-sales", ServiceSaleRoute);
app.use("/api/warehouse", WarehouseRoute);
app.use("/api/stores", StoreRoute);
app.use("/api/Banks", BanksRoute);
app.use("/api/search", SearchRoute);

// New RBAC routes
app.use("/api/roles", RoleRoute);
app.use("/api/permissions", PermissionRoute);

// ============================================
// SERVER STARTUP
// ============================================
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

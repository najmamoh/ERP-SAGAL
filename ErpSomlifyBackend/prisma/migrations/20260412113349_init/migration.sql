-- CreateEnum
CREATE TYPE "TransactionAuditType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('SALE', 'SERVICE_SALE', 'TRANSFER_OUT', 'TRANSFER_IN', 'TRANSFER_CANCELLED', 'REVERSAL', 'EXPENSE', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TransferReceiverType" AS ENUM ('BRANCH', 'BANK');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'PARTIAL', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdrawal');

-- CreateEnum
CREATE TYPE "Method" AS ENUM ('ZAAD', 'EDAHAB');

-- CreateEnum
CREATE TYPE "WarehouseTransferStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "companies" (
    "company_id" VARCHAR NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "company_address" VARCHAR(255),
    "company_phone" TEXT,
    "company_email" VARCHAR(255) NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "subscribtion_fee" MONEY,
    "subscription_end_date" DATE,
    "taxable" BOOLEAN DEFAULT false,
    "tax_percentage" DOUBLE PRECISION DEFAULT 5,
    "debt" MONEY DEFAULT 0,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,
    "created_by" INTEGER,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "stores" (
    "store_id" VARCHAR NOT NULL,
    "store_name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "location" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("store_id")
);

-- CreateTable
CREATE TABLE "store_companies" (
    "store_id" VARCHAR NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_companies_pkey" PRIMARY KEY ("store_id","company_id")
);

-- CreateTable
CREATE TABLE "TreasuryBalance" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "balance" MONEY NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreasuryBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryTransaction" (
    "id" TEXT NOT NULL,
    "treasury_id" TEXT NOT NULL,
    "amount" MONEY NOT NULL,
    "type" "TransactionAuditType" NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "reference_id" TEXT,
    "description" VARCHAR(500),
    "snapshot_balance" MONEY NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "TreasuryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyTransfer" (
    "id" TEXT NOT NULL,
    "sender_company_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "receiver_company_id" TEXT,
    "receiver_type" "TransferReceiverType" NOT NULL,
    "amount" MONEY NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "reference_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "confirmed_by" INTEGER,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "MoneyTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paid_company" (
    "id" SERIAL NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "bank_id" INTEGER,
    "expected_amount" MONEY NOT NULL,
    "amount_paid" MONEY NOT NULL,
    "payment_date" DATE NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "months_covered" INTEGER NOT NULL,
    "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paid_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "bank_id" SERIAL NOT NULL,
    "bank_name" TEXT NOT NULL,
    "amount" MONEY DEFAULT 0,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("bank_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" SERIAL NOT NULL,
    "customer_name" VARCHAR(64) NOT NULL,
    "customer_address" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(64) NOT NULL,
    "company_id" VARCHAR,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "product_purchases" (
    "purchase_id" SERIAL NOT NULL,
    "purchase_qty" DECIMAL(12,4) NOT NULL,
    "item_cost" MONEY NOT NULL,
    "purchase_discount" MONEY NOT NULL,
    "paid_amount" MONEY NOT NULL,
    "purchase_debt" MONEY NOT NULL,
    "expiry_date" DATE,
    "manufacture_date" DATE,
    "vendor_id" INTEGER,
    "product_id" INTEGER,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "product_purchases_pkey" PRIMARY KEY ("purchase_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "product_code" VARCHAR(255) NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "product_cost" MONEY,
    "product_price" MONEY NOT NULL,
    "product_alert_number" INTEGER DEFAULT 30,
    "category" VARCHAR(100),
    "description" VARCHAR(500),
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "vendor_id" SERIAL NOT NULL,
    "vendor_name" VARCHAR(255) NOT NULL,
    "vendor_address" VARCHAR(255) NOT NULL,
    "vendor_email" VARCHAR(255) NOT NULL,
    "vendor_phone" VARCHAR(64) NOT NULL,
    "company_id" VARCHAR,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("vendor_id")
);

-- CreateTable
CREATE TABLE "product_sales" (
    "sale_id" SERIAL NOT NULL,
    "sale_qty" DECIMAL(12,4) NOT NULL,
    "item_price" MONEY NOT NULL,
    "sale_discount" MONEY NOT NULL,
    "received_amount" MONEY NOT NULL,
    "unit_cost" MONEY,
    "cost_source" VARCHAR(32),
    "customer_id" INTEGER,
    "purchase_id" INTEGER,
    "stock_id" INTEGER,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,
    "taxable_sale" BOOLEAN DEFAULT false,
    "sold_by" INTEGER,

    CONSTRAINT "product_sales_pkey" PRIMARY KEY ("sale_id")
);

-- CreateTable
CREATE TABLE "employees" (
    "employee_id" SERIAL NOT NULL,
    "employee_name" VARCHAR(64) NOT NULL,
    "employee_address" VARCHAR(255) NOT NULL,
    "employee_phone" VARCHAR(64) NOT NULL,
    "salary_amount" MONEY NOT NULL,
    "company_id" VARCHAR,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "other_expenses" (
    "expense_id" SERIAL NOT NULL,
    "item_name" VARCHAR(64) NOT NULL,
    "item_qty" INTEGER NOT NULL,
    "item_cost" MONEY NOT NULL,
    "paid_amount" MONEY NOT NULL,
    "date" DATE DEFAULT CURRENT_DATE,
    "company_id" VARCHAR,
    "bank_id" INTEGER,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "other_expenses_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "salaries" (
    "salary_id" SERIAL NOT NULL,
    "paid_amount" MONEY NOT NULL,
    "date" DATE DEFAULT CURRENT_DATE,
    "employee_id" INTEGER,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "salaries_pkey" PRIMARY KEY ("salary_id")
);

-- CreateTable
CREATE TABLE "comp_users_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiry_date" DATE DEFAULT CURRENT_DATE,
    "user_id" INTEGER,

    CONSTRAINT "comp_users_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_users" (
    "user_id" SERIAL NOT NULL,
    "full_name" VARCHAR NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "company_id" VARCHAR,
    "create_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "company_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_users" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" DATE DEFAULT CURRENT_DATE,
    "updated_at" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "main_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "total_amount" MONEY NOT NULL,
    "tax_amount" MONEY NOT NULL,
    "total_paid_amount" MONEY,
    "total_discount_amount" MONEY,
    "company_id" TEXT NOT NULL,
    "customer_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sale_id" INTEGER,
    "service_sale_id" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unit_price" MONEY NOT NULL,
    "discount" MONEY NOT NULL,
    "product_id" INTEGER NOT NULL,
    "invoice_id" TEXT NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceServiceItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" MONEY NOT NULL,
    "discount" MONEY NOT NULL,
    "service_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "InvoiceServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "company_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_sales" (
    "id" TEXT NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "customer_id" INTEGER,
    "sold_by" INTEGER,
    "total_amount" MONEY NOT NULL,
    "sale_discount" MONEY NOT NULL,
    "received_amount" MONEY NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_sale_items" (
    "id" SERIAL NOT NULL,
    "service_sale_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" MONEY NOT NULL,
    "discount" MONEY NOT NULL,

    CONSTRAINT "service_sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking_accounts" (
    "account_id" TEXT NOT NULL,
    "account_name" VARCHAR(255) NOT NULL,
    "balance" MONEY NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banking_accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "banking_transactions" (
    "transaction_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "amount" MONEY NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banking_transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "Treasury" (
    "treasury_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "balance" MONEY DEFAULT 0,
    "company_id" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treasury_pkey" PRIMARY KEY ("treasury_id")
);

-- CreateTable
CREATE TABLE "Transfer_Money" (
    "transaction_id" SERIAL NOT NULL,
    "amount" MONEY NOT NULL,
    "payment_method" "Method" NOT NULL,
    "bank_id" INTEGER,
    "treasury_id" INTEGER NOT NULL,
    "currency_type" VARCHAR(64) NOT NULL,
    "company_id" VARCHAR,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "updated_at" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "Transfer_Money_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "RoleDefinition" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "company_id" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainUserRole" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MainUserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_users_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiry_date" TIMESTAMP NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "main_users_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "warehouse_id" SERIAL NOT NULL,
    "warehouse_name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "company_id" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("warehouse_id")
);

-- CreateTable
CREATE TABLE "warehouse_stock" (
    "stock_id" SERIAL NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "reserved_qty" INTEGER NOT NULL DEFAULT 0,
    "unit_cost" MONEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_stock_pkey" PRIMARY KEY ("stock_id")
);

-- CreateTable
CREATE TABLE "warehouse_transfers" (
    "transfer_id" SERIAL NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "to_warehouse_id" INTEGER,
    "stock_id" INTEGER,
    "company_id" TEXT,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "status" "WarehouseTransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_by" INTEGER,

    CONSTRAINT "warehouse_transfers_pkey" PRIMARY KEY ("transfer_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_email_key" ON "companies"("company_email");

-- CreateIndex
CREATE UNIQUE INDEX "TreasuryBalance_company_id_key" ON "TreasuryBalance"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyTransfer_reference_id_key" ON "MoneyTransfer"("reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "banks_bank_name_key" ON "banks"("bank_name");

-- CreateIndex
CREATE UNIQUE INDEX "comp_users_refresh_tokens_token_key" ON "comp_users_refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_email_key" ON "company_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "main_users_email_key" ON "main_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_sale_id_key" ON "Invoice"("sale_id");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_service_sale_id_key" ON "Invoice"("service_sale_id");

-- CreateIndex
CREATE INDEX "Service_job_id_idx" ON "Service"("job_id");

-- CreateIndex
CREATE INDEX "Service_company_id_idx" ON "Service"("company_id");

-- CreateIndex
CREATE INDEX "banking_transactions_account_id_idx" ON "banking_transactions"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "RoleDefinition_name_key" ON "RoleDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_id_permission_id_key" ON "RolePermission"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_key" ON "UserRole"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "MainUserRole_user_id_role_id_key" ON "MainUserRole"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "main_users_refresh_tokens_token_key" ON "main_users_refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "warehouses_company_id_idx" ON "warehouses"("company_id");

-- CreateIndex
CREATE INDEX "warehouse_stock_warehouse_id_idx" ON "warehouse_stock"("warehouse_id");

-- CreateIndex
CREATE INDEX "warehouse_stock_product_id_idx" ON "warehouse_stock"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_stock_warehouse_id_product_id_key" ON "warehouse_stock"("warehouse_id", "product_id");

-- CreateIndex
CREATE INDEX "warehouse_transfers_warehouse_id_idx" ON "warehouse_transfers"("warehouse_id");

-- CreateIndex
CREATE INDEX "warehouse_transfers_to_warehouse_id_idx" ON "warehouse_transfers"("to_warehouse_id");

-- CreateIndex
CREATE INDEX "warehouse_transfers_company_id_idx" ON "warehouse_transfers"("company_id");

-- CreateIndex
CREATE INDEX "warehouse_transfers_status_idx" ON "warehouse_transfers"("status");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "main_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_companies" ADD CONSTRAINT "store_companies_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_companies" ADD CONSTRAINT "store_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryBalance" ADD CONSTRAINT "TreasuryBalance_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryTransaction" ADD CONSTRAINT "TreasuryTransaction_treasury_id_fkey" FOREIGN KEY ("treasury_id") REFERENCES "TreasuryBalance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyTransfer" ADD CONSTRAINT "MoneyTransfer_sender_company_id_fkey" FOREIGN KEY ("sender_company_id") REFERENCES "companies"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyTransfer" ADD CONSTRAINT "MoneyTransfer_receiver_company_id_fkey" FOREIGN KEY ("receiver_company_id") REFERENCES "companies"("company_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paid_company" ADD CONSTRAINT "Paid_company_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paid_company" ADD CONSTRAINT "Paid_company_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("bank_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_purchases" ADD CONSTRAINT "product_purchases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_purchases" ADD CONSTRAINT "product_purchases_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_sales" ADD CONSTRAINT "product_sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_sales" ADD CONSTRAINT "product_sales_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "product_purchases"("purchase_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_sales" ADD CONSTRAINT "product_sales_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "warehouse_stock"("stock_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_sales" ADD CONSTRAINT "product_sales_sold_by_fkey" FOREIGN KEY ("sold_by") REFERENCES "company_users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "other_expenses" ADD CONSTRAINT "other_expenses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "other_expenses" ADD CONSTRAINT "other_expenses_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("bank_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comp_users_refresh_tokens" ADD CONSTRAINT "comp_users_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "company_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "product_sales"("sale_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_service_sale_id_fkey" FOREIGN KEY ("service_sale_id") REFERENCES "service_sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceServiceItem" ADD CONSTRAINT "InvoiceServiceItem_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceServiceItem" ADD CONSTRAINT "InvoiceServiceItem_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jobs" ADD CONSTRAINT "Jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_sales" ADD CONSTRAINT "service_sales_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_sales" ADD CONSTRAINT "service_sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_sales" ADD CONSTRAINT "service_sales_sold_by_fkey" FOREIGN KEY ("sold_by") REFERENCES "company_users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_sale_items" ADD CONSTRAINT "service_sale_items_service_sale_id_fkey" FOREIGN KEY ("service_sale_id") REFERENCES "service_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_sale_items" ADD CONSTRAINT "service_sale_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_transactions" ADD CONSTRAINT "banking_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "banking_accounts"("account_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treasury" ADD CONSTRAINT "Treasury_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer_Money" ADD CONSTRAINT "Transfer_Money_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("bank_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer_Money" ADD CONSTRAINT "Transfer_Money_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer_Money" ADD CONSTRAINT "Transfer_Money_treasury_id_fkey" FOREIGN KEY ("treasury_id") REFERENCES "Treasury"("treasury_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "RoleDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "company_users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "RoleDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainUserRole" ADD CONSTRAINT "MainUserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "main_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainUserRole" ADD CONSTRAINT "MainUserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "RoleDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_users_refresh_tokens" ADD CONSTRAINT "main_users_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "main_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("warehouse_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("warehouse_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "warehouses"("warehouse_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_transfers" ADD CONSTRAINT "warehouse_transfers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE CASCADE ON UPDATE CASCADE;

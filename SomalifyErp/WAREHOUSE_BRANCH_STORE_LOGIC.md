# Branch, Store & Warehouse Logic

## How it fits together

- **Company** = your business entity (e.g. head office or a branch).
- **Store (company store)** = that company’s sellable stock. In the app it’s the same as that company’s **purchases** (product_purchases for products that belong to that company). So “Company Stores” tab = stock per company.
- **Warehouse** = a separate storage location. Stock in warehouses is in `warehouse_stock`. You can have many warehouses (e.g. one per branch or one central).
- **Transfer** = move goods from a **warehouse** to a **company (store)**. Flow: create transfer (PENDING) → approve (APPROVED) → complete (COMPLETED). On complete, warehouse stock is reduced and a purchase row is created for that company so the stock appears in that company’s store.

So: **one branch (company) can have one “store” (its purchases) and can receive goods from any warehouse via transfers.**

If later you want “one branch, many physical stores”, you would add a `stores` table (e.g. store_id, company_id, name, address) and link transfers to `store_id` instead of (or in addition to) `company_id`.

---

## What was wrong and what was fixed

### 1. Creating warehouse “not working”
- **Cause:** Backend had no warehouse API and no “Create warehouse” on the frontend.
- **Fix:**
  - **Backend:** New Prisma models `warehouses`, `warehouse_stock`, `warehouse_transfers`; new `warehouseController` and `WarehouseRoute`; registered at `/api/warehouse`.  
    - `POST /api/warehouse` → create warehouse.  
    - `POST /api/warehouse/:warehouseId/stock` → add or top-up stock (product_id, quantity).
  - **Frontend:** `createWarehouseFn` in `WarehouseSlice`; “Add Warehouse” button and Create Warehouse modal on the Warehouse page (name, location, description).

### 2. Transferring goods “cannot work”
- **Cause:** Backend had no warehouse or transfer APIs (only `Transfer_Money` for money).
- **Fix:**
  - **Backend:**  
    - `GET /api/warehouse` → list warehouses.  
    - `GET /api/warehouse/stock/:warehouseId` → stock in a warehouse.  
    - `GET /api/warehouse/transfers` → list transfers (optional `?status=PENDING|APPROVED|COMPLETED|CANCELLED`).  
    - `POST /api/warehouse/transfer` → create transfer (warehouse_id, product_id, company_id, quantity, notes).  
    - `PUT /api/warehouse/transfers/:id/approve` → set status to APPROVED.  
    - `PUT /api/warehouse/transfers/:id/complete` → deduct from warehouse_stock and create a purchase for the company so stock appears in that company’s store.  
    - `PUT /api/warehouse/transfers/:id/cancel` → set status to CANCELLED.
  - **Frontend:** Already called these URLs; they now hit the new backend.

---

## What you need to do

1. **Database**
   - Stop the backend if it’s running.
   - In `sg-bc`: run `npx prisma generate`, then `npx prisma migrate dev --name add_warehouse` (or your DB workflow). That creates `warehouses`, `warehouse_stock`, `warehouse_transfers` tables.

2. **API base URL**
   - Frontend uses `Url` from `Interfaces.tsx` (e.g. `http://localhost:8080/api`). If your backend runs on port **8181**, set:
     - `Url = 'http://localhost:8181/api'`  
     - or use `VITE_API_URL` and point it to `http://localhost:8181/api`.

3. **Adding stock to a warehouse**
   - Backend: `POST /api/warehouse/:warehouseId/stock` with body `{ product_id, quantity }`.
   - You can either:
     - Add a small “Add stock” form on the Warehouse page (warehouse + product + quantity) that calls this, or  
     - Use Postman/curl to add stock for testing, or  
     - Later: when creating a purchase, allow “Receive to warehouse” and in the backend create/update `warehouse_stock` and optionally skip or reduce adding to company store.

4. **Branch → multiple stores (optional later)**
   - Add a `stores` table (e.g. company_id, store_name, address).
   - Add `store_id` to `warehouse_transfers` and complete transfers into that store (e.g. a `store_stock` table or still use product_purchases with a store_id if you extend the schema).

---

## Quick flow

1. Create warehouses (UI: “Add Warehouse”).
2. Add stock to a warehouse (API or future “Add stock” UI): `POST /api/warehouse/1/stock` `{ "product_id": 5, "quantity": 100 }`.
3. On Warehouse page: open a warehouse → see stock → “Transfer” → choose company and quantity → Create Transfer.
4. In Transfers tab: Approve → Complete. Stock leaves the warehouse and appears in that company’s store (Company Stores tab).

import { Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';
import { WarehouseTransferStatus } from '@prisma/client';

// GET /api/warehouse - list all warehouses (with stock and product for transfer list)
export const getAllWarehouses = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const warehouses = await prisma.warehouses.findMany({
      where: { is_active: true },
      include: {
        company: { select: { company_id: true, company_name: true } },
        stock: {
          include: {
            product: {
              select: { product_id: true, product_code: true, product_name: true },
            },
          },
        },
      },
      orderBy: { warehouse_id: 'asc' },
    });
    res.json({ data: warehouses, total: warehouses.length });
  } catch (error) {
    console.error('getAllWarehouses error:', error);
    res.status(500).json({ message: 'Failed to fetch warehouses' });
  }
};

// GET /api/warehouse/transfer-destinations - stores (with linked companies) and their warehouse_id for transfer dropdown.
// Ensures each company linked to a store has a warehouse (creates default if missing).
export const getTransferDestinations = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const stores = await prisma.stores.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        store_companies: {
          include: { company: { select: { company_id: true, company_name: true } } },
        },
      },
    });
    const destinations: { store_name: string; company_name: string; warehouse_id: number }[] = [];
    for (const store of stores) {
      const companies = store.store_companies || [];
      for (const sc of companies) {
        const companyId = sc.company?.company_id;
        if (!companyId) continue;
        let warehouse = await prisma.warehouses.findFirst({
          where: { company_id: companyId, is_active: true },
          orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
        });
        if (!warehouse) {
          warehouse = await prisma.warehouses.create({
            data: {
              warehouse_name: 'Store',
              company_id: companyId,
              is_default: true,
              is_active: true,
            },
          });
        }
        destinations.push({
          store_name: store.store_name,
          company_name: sc.company?.company_name || '',
          warehouse_id: warehouse.warehouse_id,
        });
      }
    }
    res.json({ data: destinations, total: destinations.length });
  } catch (error) {
    console.error('getTransferDestinations error:', error);
    res.status(500).json({ message: 'Failed to fetch transfer destinations' });
  }
};

// POST /api/warehouse/ensure-warehouses - ensure each company has a warehouse (create if missing). Returns list for transfer dropdown.
// Body: { company_ids: string[] }. Response: { data: { company_id, warehouse_id, company_name }[] }.
export const ensureCompanyWarehouses = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { company_ids } = req.body as { company_ids?: string[] };
    const ids = Array.isArray(company_ids) ? company_ids.filter((id): id is string => typeof id === 'string') : [];
    if (ids.length === 0) {
      res.json({ data: [], total: 0 });
      return;
    }
    const result: { company_id: string; warehouse_id: number; company_name: string }[] = [];
    for (const companyId of ids) {
      const company = await prisma.companies.findUnique({
        where: { company_id: companyId },
        select: { company_id: true, company_name: true },
      });
      if (!company) continue;
      let warehouse = await prisma.warehouses.findFirst({
        where: { company_id: companyId, is_active: true },
        orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
      });
      if (!warehouse) {
        warehouse = await prisma.warehouses.create({
          data: {
            warehouse_name: 'Store',
            company_id: companyId,
            is_default: true,
            is_active: true,
          },
        });
      }
      result.push({
        company_id: company.company_id,
        warehouse_id: warehouse.warehouse_id,
        company_name: company.company_name,
      });
    }
    res.json({ data: result, total: result.length });
  } catch (error) {
    console.error('ensureCompanyWarehouses error:', error);
    res.status(500).json({ message: 'Failed to ensure company warehouses' });
  }
};

// GET /api/warehouse/by-company/:companyId - get company's store (default warehouse) and its stock
// Query params: search (product name/code), category, page, pageSize
export const getStoreByCompany = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = req.params.companyId;
    const userCompanyId = (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    }
    // Company users can only access their own store; admin can pass any companyId
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    if (!isMainAdmin && userCompanyId !== companyId) {
      res.status(403).json({ message: 'You can only access your company store' });
      return;
    }

    // Parse query params for filtering
    const search = (req.query.search as string)?.trim() || '';
    const category = (req.query.category as string)?.trim() || '';
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 50));

    // Build stock filter (combine search + category with AND)
    const stockWhere: any = {};
    if (search || category) {
      const productConditions: any[] = [];
      if (search) {
        productConditions.push({
          OR: [
            { product_name: { contains: search, mode: 'insensitive' } },
            { product_code: { contains: search, mode: 'insensitive' } },
          ],
        });
      }
      if (category) {
        productConditions.push({
          category: { equals: category, mode: 'insensitive' },
        });
      }
      stockWhere.product =
        productConditions.length === 1
          ? productConditions[0]
          : { AND: productConditions };
    }

    const store = await prisma.warehouses.findFirst({
      where: { company_id: companyId, is_active: true },
      orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
      include: {
        stock: {
          where: Object.keys(stockWhere).length > 0 ? stockWhere : undefined,
          include: {
            product: true,
          },
          orderBy: { stock_id: 'desc' },
        },
        company: true,
      },
    });
    if (!store) {
      const linkedOnlyIds = (
        await prisma.store_companies.findMany({
          where: { company_id: companyId },
          select: { store_id: true },
        })
      ).map((row) => row.store_id);
      const assignedOnly = linkedOnlyIds.length
        ? await prisma.store_stock.findMany({
            where: {
              store_id: { in: linkedOnlyIds },
              quantity: { gt: 0 },
              ...(Object.keys(stockWhere).length > 0 ? stockWhere : {}),
            },
            include: { product: true },
            orderBy: { stock_id: 'desc' },
          })
        : [];
      if (assignedOnly.length === 0) {
        res.status(404).json({ message: 'No store found for this company' });
        return;
      }
      const categoriesOnly = [...new Set(
        assignedOnly.map((row) => row.product?.category).filter((c): c is string => !!c)
      )].sort();
      const totalItemsOnly = assignedOnly.length;
      const pageRows = assignedOnly.slice((page - 1) * pageSize, page * pageSize);
      res.json({
        warehouse_id: 0,
        warehouse_name: 'Store',
        company_id: companyId,
        stock: pageRows.map((row) => ({
          ...row,
          qty_sold: 0,
          from_store_stock: true,
        })),
        totalItems: totalItemsOnly,
        totalPages: Math.ceil(totalItemsOnly / pageSize),
        currentPage: page,
        pageSize,
        categories: categoriesOnly,
      });
      return;
    }

    // Collect distinct categories from ALL stock for filter dropdown
    const allStock = await prisma.warehouse_stock.findMany({
      where: { warehouse_id: store.warehouse_id },
      include: { product: { select: { category: true } } },
    });
    const categories = [...new Set(
      allStock
        .map((s) => s.product?.category)
        .filter((c): c is string => !!c)
    )].sort();

    const linkedStoreIds = (
      await prisma.store_companies.findMany({
        where: { company_id: companyId },
        select: { store_id: true },
      })
    ).map((row) => row.store_id);

    const assignedStock = linkedStoreIds.length
      ? await prisma.store_stock.findMany({
          where: {
            store_id: { in: linkedStoreIds },
            quantity: { gt: 0 },
            ...(Object.keys(stockWhere).length > 0 ? stockWhere : {}),
          },
          include: { product: true },
          orderBy: { stock_id: 'desc' },
        })
      : [];

    const seenProductIds = new Set(store.stock.map((row) => row.product_id));
    const mergedStock = [
      ...store.stock,
      ...assignedStock
        .filter((row) => !seenProductIds.has(row.product_id))
        .map((row) => ({
          stock_id: row.stock_id,
          warehouse_id: store.warehouse_id,
          product_id: row.product_id,
          quantity: row.quantity,
          reserved_qty: 0,
          unit_cost: null,
          created_at: row.created_at,
          updated_at: row.updated_at,
          product: row.product,
          from_store_stock: true,
        })),
    ];

    // Pagination on filtered stock
    const totalItems = mergedStock.length;
    const paginatedStockRaw = mergedStock.slice((page - 1) * pageSize, page * pageSize);
    const stockIds = paginatedStockRaw
      .filter((s) => !(s as { from_store_stock?: boolean }).from_store_stock)
      .map((s) => s.stock_id);

    // Aggregate qty sold per stock_id from product_sales
    const soldAgg = stockIds.length
      ? await prisma.product_sales.groupBy({
          by: ['stock_id'],
          where: { stock_id: { in: stockIds } },
          _sum: { sale_qty: true },
        })
      : [];
    const soldMap = Object.fromEntries(
      soldAgg.map((a) => [a.stock_id!, a._sum.sale_qty ?? 0])
    );
    const paginatedStock = paginatedStockRaw.map((s) => ({
      ...s,
      qty_sold: soldMap[s.stock_id] ?? 0,
    }));

    res.json({
      ...store,
      stock: paginatedStock,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
      pageSize,
      categories,
    });
  } catch (error) {
    console.error('getStoreByCompany error:', error);
    res.status(500).json({ message: 'Failed to fetch store' });
  }
};

// GET /api/warehouse/transfers/to-company/:companyId - list transfers to this company OR to any company linked to the same store(s)
export const getTransfersToCompany = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = req.params.companyId;
    const userCompanyId = (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    }
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    if (!isMainAdmin && userCompanyId !== companyId) {
      res.status(403).json({ message: 'You can only view transfers to your company' });
      return;
    }
    // Companies that share a store with this company can all see the same pending transfers
    const storesLinkedToCompany = await prisma.store_companies.findMany({
      where: { company_id: companyId },
      select: { store_id: true },
    });
    const storeIds = storesLinkedToCompany.map((sc) => sc.store_id);
    const companyIdsLinkedToSameStores =
      storeIds.length === 0
        ? [companyId]
        : (
            await prisma.store_companies.findMany({
              where: { store_id: { in: storeIds } },
              select: { company_id: true },
              distinct: ['company_id'],
            })
          ).map((sc) => sc.company_id);
    const status = req.query.status as string | undefined;
    const where: any = { company_id: { in: companyIdsLinkedToSameStores } };
    if (status && ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status as WarehouseTransferStatus;
    }
    const transfers = await prisma.warehouse_transfers.findMany({
      where,
      include: {
        warehouse: true,
        to_warehouse: true,
        product: true,
        company: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: transfers, total: transfers.length });
  } catch (error) {
    console.error('getTransfersToCompany error:', error);
    res.status(500).json({ message: 'Failed to fetch transfers' });
  }
};

// POST /api/warehouse - create warehouse
export const createWarehouse = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { warehouse_name, location, description } = req.body;
    if (!warehouse_name || typeof warehouse_name !== 'string' || !warehouse_name.trim()) {
      res.status(400).json({ message: 'warehouse_name is required' });
      return;
    }
    const count = await prisma.warehouses.count();
    const isFirst = count === 0;
    const warehouse = await prisma.warehouses.create({
      data: {
        warehouse_name: warehouse_name.trim(),
        location: location ? String(location).trim() : null,
        description: description ? String(description).trim() : null,
        is_active: true,
        is_default: isFirst,
      },
    });
    res.status(201).json(warehouse);
  } catch (error) {
    console.error('createWarehouse error:', error);
    res.status(500).json({ message: 'Failed to create warehouse' });
  }
};

// PUT /api/warehouse/:warehouseId/set-default - set warehouse as default for incoming purchases
export const setDefaultWarehouse = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const warehouseId = parseInt(req.params.warehouseId, 10);
    if (isNaN(warehouseId)) {
      res.status(400).json({ message: 'Invalid warehouse ID' });
      return;
    }
    const warehouse = await prisma.warehouses.findUnique({ where: { warehouse_id: warehouseId } });
    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }
    await prisma.$transaction([
      prisma.warehouses.updateMany({ data: { is_default: false } }),
      prisma.warehouses.update({ where: { warehouse_id: warehouseId }, data: { is_default: true } }),
    ]);
    res.json({ message: 'Default warehouse updated', warehouse_id: warehouseId });
  } catch (error) {
    console.error('setDefaultWarehouse error:', error);
    res.status(500).json({ message: 'Failed to set default warehouse' });
  }
};

// GET /api/warehouse/stock/:warehouseId - get stock for a warehouse
export const getWarehouseStock = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const warehouseId = parseInt(req.params.warehouseId, 10);
    if (isNaN(warehouseId)) {
      res.status(400).json({ message: 'Invalid warehouse ID' });
      return;
    }
    const stock = await prisma.warehouse_stock.findMany({
      where: { warehouse_id: warehouseId },
      include: {
        product: true,
      },
    });
    res.json({ data: stock });
  } catch (error) {
    console.error('getWarehouseStock error:', error);
    res.status(500).json({ message: 'Failed to fetch warehouse stock' });
  }
};

// GET /api/warehouse/transfers - list all transfers (optional status filter)
export const getAllTransfers = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const where = status && ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'].includes(status)
      ? { status: status as WarehouseTransferStatus }
      : {};
    const transfers = await prisma.warehouse_transfers.findMany({
      where,
      include: {
        warehouse: true,
        to_warehouse: true,
        product: true,
        company: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: transfers, total: transfers.length });
  } catch (error) {
    console.error('getAllTransfers error:', error);
    res.status(500).json({ message: 'Failed to fetch transfers' });
  }
};

// POST /api/warehouse/transfer - create a transfer (warehouse/store -> warehouse/store)
export const createTransfer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { warehouse_id, to_warehouse_id, product_id, quantity, notes } = req.body;
    if (!warehouse_id || !product_id || quantity == null || Number(quantity) <= 0) {
      res.status(400).json({ message: 'warehouse_id, product_id and quantity (greater than 0) are required' });
      return;
    }
    const wid = parseInt(warehouse_id, 10);
    const pid = parseInt(product_id, 10);
    const qty = parseFloat(String(quantity).replace(',', '.'));
    const toWid = to_warehouse_id != null ? parseInt(to_warehouse_id, 10) : null;
    if (isNaN(wid) || isNaN(pid) || isNaN(qty) || qty <= 0) {
      res.status(400).json({ message: 'Invalid warehouse_id, product_id or quantity' });
      return;
    }
    if (toWid == null || isNaN(toWid)) {
      res.status(400).json({ message: 'to_warehouse_id (destination store/warehouse) is required' });
      return;
    }
    if (wid === toWid) {
      res.status(400).json({ message: 'Source and destination must be different' });
      return;
    }
    const stock = await prisma.warehouse_stock.findFirst({
      where: { warehouse_id: wid, product_id: pid },
    });
    if (!stock) {
      res.status(400).json({ message: 'No stock for this product in this warehouse' });
      return;
    }
    const availableQty = Number(stock.quantity) - Number(stock.reserved_qty);
    if (qty > availableQty) {
      res.status(400).json({ message: `Only ${availableQty} available` });
      return;
    }
    const toWarehouse = await prisma.warehouses.findUnique({ where: { warehouse_id: toWid }, include: { company: true } });
    if (!toWarehouse || !toWarehouse.is_active) {
      res.status(400).json({ message: 'Destination warehouse/store not found or inactive' });
      return;
    }
    // Deduct from HQ warehouse on transfer creation and create transfer; remove source stock row if quantity becomes 0
    const newSourceQty = Number(stock.quantity) - qty;
    const transfer = await prisma.$transaction(async (tx) => {
      if (newSourceQty <= 0) {
        await tx.warehouse_stock.delete({
          where: { stock_id: stock.stock_id },
        });
      } else {
        await tx.warehouse_stock.update({
          where: { stock_id: stock.stock_id },
          data: { quantity: newSourceQty },
        });
      }

      // Create transfer record (stock_id null if source row was deleted)
      return tx.warehouse_transfers.create({
        data: {
          warehouse_id: wid,
          to_warehouse_id: toWid,
          stock_id: newSourceQty <= 0 ? null : stock.stock_id,
          company_id: toWarehouse.company_id,
          product_id: pid,
          quantity: qty,
          status: 'PENDING',
          notes: notes ? String(notes).trim() : null,
        },
        include: {
          warehouse: true,
          to_warehouse: true,
          product: true,
          company: true,
        },
      });
    });
    res.status(201).json(transfer);
  } catch (error) {
    console.error('createTransfer error:', error);
    res.status(500).json({ message: 'Failed to create transfer' });
  }
};

// PUT /api/warehouse/transfers/:id/approve - admin or company linked to same store as destination can approve
export const approveTransfer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userCompanyId = (req.user as any)?.company_id;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid transfer ID' });
      return;
    }
    const transfer = await prisma.warehouse_transfers.findUnique({ where: { transfer_id: id } });
    if (!transfer) {
      res.status(404).json({ message: 'Transfer not found' });
      return;
    }
    if (transfer.status !== 'PENDING') {
      res.status(400).json({ message: 'Only PENDING transfers can be approved' });
      return;
    }
    if (isMainAdmin) {
      // Admin can approve any transfer
    } else {
      const destCompanyStores = await prisma.store_companies.findMany({
        where: { company_id: transfer.company_id ?? '' },
        select: { store_id: true },
      });
      const storeIds = destCompanyStores.map((sc) => sc.store_id);
      const allowedCompanyIds =
        storeIds.length === 0
          ? transfer.company_id
            ? [transfer.company_id]
            : []
          : (await prisma.store_companies.findMany({
              where: { store_id: { in: storeIds } },
              select: { company_id: true },
              distinct: ['company_id'],
            })).map((sc) => sc.company_id);
      if (!userCompanyId || !allowedCompanyIds.includes(userCompanyId)) {
        res.status(403).json({ message: 'Only a company linked to the same store as the transfer destination can approve' });
        return;
      }
    }
    await prisma.warehouse_transfers.update({
      where: { transfer_id: id },
      data: { status: 'APPROVED' },
    });
    res.json({ message: 'Approved' });
  } catch (error) {
    console.error('approveTransfer error:', error);
    res.status(500).json({ message: 'Failed to approve transfer' });
  }
};

// PUT /api/warehouse/transfers/:id/complete - any company linked to same store can complete; items go to accepter's warehouse
export const completeTransfer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const accepterCompanyId = (req.user as any)?.company_id;
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid transfer ID' });
      return;
    }
    const transfer = await prisma.warehouse_transfers.findUnique({
      where: { transfer_id: id },
      include: { product: true, to_warehouse: true },
    });
    if (!transfer) {
      res.status(404).json({ message: 'Transfer not found' });
      return;
    }
    if (transfer.status !== 'APPROVED') {
      res.status(400).json({ message: 'Only APPROVED transfers can be completed' });
      return;
    }
    // Allow completion if accepter's company shares a store with the transfer's destination company
    const destCompanyStores = await prisma.store_companies.findMany({
      where: { company_id: transfer.company_id ?? '' },
      select: { store_id: true },
    });
    const storeIds = destCompanyStores.map((sc) => sc.store_id);
    const allowedCompanyIds =
      storeIds.length === 0
        ? transfer.company_id
          ? [transfer.company_id]
          : []
        : (await prisma.store_companies.findMany({
            where: { store_id: { in: storeIds } },
            select: { company_id: true },
            distinct: ['company_id'],
          })).map((sc) => sc.company_id);
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    if (!isMainAdmin && (!accepterCompanyId || !allowedCompanyIds.includes(accepterCompanyId))) {
      res.status(403).json({ message: 'Only a company linked to the same store as the transfer destination can complete this transfer' });
      return;
    }
    // For admin completing: use transfer.company_id or to_warehouse.company_id as accepter (destination company)
    const destCompanyId = transfer.company_id ?? (transfer as any).to_warehouse?.company_id;
    const effectiveAccepterCompanyId = isMainAdmin ? (destCompanyId ?? accepterCompanyId) : accepterCompanyId;
    if (!effectiveAccepterCompanyId) {
      res.status(400).json({ message: 'Transfer destination company not set' });
      return;
    }
    const completedTransfer = await prisma.$transaction(async (tx) => {
      // NOTE: Stock was already deducted from the source (HQ) warehouse when the
      // transfer was CREATED (in createTransfer). We do NOT deduct again here.

      // Find or auto-create a warehouse for the accepter's company
      let accepterWarehouse = await tx.warehouses.findFirst({
        where: { company_id: effectiveAccepterCompanyId, is_active: true },
        orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
      });

      if (!accepterWarehouse) {
        // Auto-create a default warehouse/store for this company
        accepterWarehouse = await tx.warehouses.create({
          data: {
            warehouse_name: `Store`,
            company_id: effectiveAccepterCompanyId,
            is_default: true,
            is_active: true,
          },
        });
      }

      const targetWarehouseId = accepterWarehouse.warehouse_id;
      const sourceStock = await tx.warehouse_stock.findFirst({
        where: {
          warehouse_id: transfer.warehouse_id,
          product_id: transfer.product_id,
        },
      });
      const transferUnitCost = sourceStock?.unit_cost != null ? Number(sourceStock.unit_cost) : null;

      // Add stock to the accepter's company warehouse (keep real cost from source when present)
      const existingStock = await tx.warehouse_stock.findUnique({
        where: {
          warehouse_id_product_id: {
            warehouse_id: targetWarehouseId,
            product_id: transfer.product_id,
          },
        },
      });
      const addQty = Number(transfer.quantity);
      if (existingStock) {
        const existingQty = Number(existingStock.quantity);
        const existingCost = Number((existingStock as any).unit_cost ?? 0);
        const newQty = existingQty + addQty;
        const incomingCost = transferUnitCost ?? 0;
        const newUnitCost = newQty > 0 ? (existingQty * existingCost + addQty * incomingCost) / newQty : (transferUnitCost ?? 0);
        await tx.warehouse_stock.update({
          where: { stock_id: existingStock.stock_id },
          data: {
            quantity: newQty,
            ...(transferUnitCost != null && { unit_cost: newUnitCost }),
            updated_at: new Date(),
          },
        });
      } else {
        await tx.warehouse_stock.create({
          data: {
            warehouse_id: targetWarehouseId,
            product_id: transfer.product_id,
            quantity: transfer.quantity,
            unit_cost: transferUnitCost,
          },
        });
      }

      const updated = await tx.warehouse_transfers.update({
        where: { transfer_id: id },
        data: { status: WarehouseTransferStatus.COMPLETED, completed_at: new Date() },
        include: { warehouse: true, to_warehouse: true, product: true, company: true },
      });
      return updated;
    });
    res.json({ message: 'Transfer completed', transfer: completedTransfer });
  } catch (error: any) {
    console.error('completeTransfer error:', error);
    res.status(500).json({ message: error?.message || 'Failed to complete transfer' });
  }
};

// PUT /api/warehouse/transfers/:id/cancel - any company linked to same store as destination can cancel/decline
export const cancelTransfer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userCompanyId = (req.user as any)?.company_id;
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid transfer ID' });
      return;
    }
    const transfer = await prisma.warehouse_transfers.findUnique({ where: { transfer_id: id } });
    if (!transfer) {
      res.status(404).json({ message: 'Transfer not found' });
      return;
    }
    if (transfer.status === 'COMPLETED') {
      res.status(400).json({ message: 'Cannot cancel completed transfer' });
      return;
    }
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    if (!isMainAdmin) {
      const destCompanyStores = await prisma.store_companies.findMany({
        where: { company_id: transfer.company_id ?? '' },
        select: { store_id: true },
      });
      const storeIds = destCompanyStores.map((sc) => sc.store_id);
      const allowedCompanyIds =
        storeIds.length === 0
          ? transfer.company_id
            ? [transfer.company_id]
            : []
          : (await prisma.store_companies.findMany({
              where: { store_id: { in: storeIds } },
              select: { company_id: true },
              distinct: ['company_id'],
            })).map((sc) => sc.company_id);
      if (!userCompanyId || !allowedCompanyIds.includes(userCompanyId)) {
        res.status(403).json({ message: 'Only a company linked to the same store as the transfer destination can cancel' });
        return;
      }
    }
    // Return stock to source warehouse and cancel
    await prisma.$transaction(async (tx) => {
      // 1) Mark transfer as cancelled
      await tx.warehouse_transfers.update({
        where: { transfer_id: id },
        data: { status: 'CANCELLED' },
      });

      // 2) Return quantity to source warehouse stock
      const existing = await tx.warehouse_stock.findFirst({
        where: { warehouse_id: transfer.warehouse_id, product_id: transfer.product_id },
      });
      if (existing) {
        await tx.warehouse_stock.update({
          where: { stock_id: existing.stock_id },
          data: { quantity: Number(existing.quantity) + Number(transfer.quantity) },
        });
      } else {
        await tx.warehouse_stock.create({
          data: {
            warehouse_id: transfer.warehouse_id,
            product_id: transfer.product_id,
            quantity: transfer.quantity,
          },
        });
      }
    });

    res.json({ message: 'Transfer declined — items returned to source warehouse' });
  } catch (error) {
    console.error('cancelTransfer error:', error);
    res.status(500).json({ message: 'Failed to cancel transfer' });
  }
};

// POST /api/warehouse/:warehouseId/stock - add or adjust stock (e.g. receive goods into warehouse)
export const addWarehouseStock = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const warehouseId = parseInt(req.params.warehouseId, 10);
    const { product_id, quantity } = req.body;
    if (isNaN(warehouseId) || !product_id || quantity == null) {
      res.status(400).json({ message: 'warehouseId, product_id and quantity required' });
      return;
    }
    const pid = parseInt(product_id, 10);
    const qty = parseFloat(String(quantity).replace(',', '.'));
    const unitCost = req.body.unit_cost != null ? parseFloat(String(req.body.unit_cost).replace(',', '.')) : undefined;
    if (isNaN(pid) || isNaN(qty) || qty <= 0) {
      res.status(400).json({ message: 'Invalid product_id or quantity (decimals like 0.5 allowed)' });
      return;
    }
    const warehouse = await prisma.warehouses.findUnique({ where: { warehouse_id: warehouseId } });
    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }
    const product = await prisma.products.findUnique({ where: { product_id: pid } });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    const existing = await prisma.warehouse_stock.findUnique({
      where: { warehouse_id_product_id: { warehouse_id: warehouseId, product_id: pid } },
    });
    const incomingCost = unitCost != null && !isNaN(unitCost) && unitCost >= 0 ? unitCost : 0;
    let stock;
    if (existing) {
      const existingQty = Number(existing.quantity);
      const existingCost = Number((existing as any).unit_cost ?? 0);
      const newQty = existingQty + qty;
      const newUnitCost = newQty > 0 && (incomingCost > 0 || existingCost > 0)
        ? (existingQty * existingCost + qty * incomingCost) / newQty
        : undefined;
      stock = await prisma.warehouse_stock.update({
        where: { stock_id: existing.stock_id },
        data: {
          quantity: newQty,
          ...(newUnitCost != null && { unit_cost: newUnitCost }),
          updated_at: new Date(),
        },
        include: { product: true },
      });
    } else {
      stock = await prisma.warehouse_stock.create({
        data: {
          warehouse_id: warehouseId,
          product_id: pid,
          quantity: qty,
          ...(incomingCost > 0 && { unit_cost: incomingCost }),
        },
        include: { product: true },
      });
    }
    res.status(201).json(stock);
  } catch (error) {
    console.error('addWarehouseStock error:', error);
    res.status(500).json({ message: 'Failed to add warehouse stock' });
  }
};

// POST /api/warehouse/transfer-from-companies - move all company purchases into main warehouse
export const transferFromCompanies = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const targetWarehouseId = req.body.warehouse_id
      ? parseInt(req.body.warehouse_id, 10)
      : undefined;

    const warehouse = targetWarehouseId
      ? await prisma.warehouses.findUnique({ where: { warehouse_id: targetWarehouseId } })
      : await prisma.warehouses.findFirst({
          where: { is_active: true },
          orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
        });

    if (!warehouse) {
      res.status(404).json({ message: 'No warehouse found. Create a warehouse first.' });
      return;
    }

    const purchases = await prisma.product_purchases.findMany({
      where: { purchase_qty: { gt: 0 } },
      include: { products: true },
    });

    if (purchases.length === 0) {
      res.json({
        message: 'No purchases to transfer',
        transferred: 0,
        warehouse_id: warehouse.warehouse_id,
      });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const productQuantities: Record<number, { qty: number; cost: number }> = {};
      for (const p of purchases) {
        const pid = p.product_id;
        const q = Number(p.purchase_qty);
        const cost = Number((p as any).item_cost ?? 0);
        if (pid && q > 0) {
          const cur = productQuantities[pid] || { qty: 0, cost: 0 };
          productQuantities[pid] = { qty: cur.qty + q, cost: cur.cost + q * cost };
        }
      }

      for (const purchase of purchases) {
        if (Number(purchase.purchase_qty) > 0) {
          await tx.product_purchases.update({
            where: { purchase_id: purchase.purchase_id },
            data: { purchase_qty: 0 },
          });
        }
      }

      let transferred = 0;
      for (const [productIdStr, agg] of Object.entries(productQuantities)) {
        const pid = parseInt(productIdStr, 10);
        const qty = agg.qty;
        if (isNaN(pid) || qty <= 0) continue;
        const unitCost = qty > 0 ? agg.cost / qty : 0;
        const existing = await tx.warehouse_stock.findUnique({
          where: {
            warehouse_id_product_id: {
              warehouse_id: warehouse.warehouse_id,
              product_id: pid,
            },
          },
        });
        if (existing) {
          const existingQty = Number(existing.quantity);
          const existingCost = Number((existing as any).unit_cost ?? 0);
          const newQty = existingQty + qty;
          const newUnitCost = newQty > 0 ? (existingQty * existingCost + qty * unitCost) / newQty : unitCost;
          await tx.warehouse_stock.update({
            where: { stock_id: existing.stock_id },
            data: {
              quantity: newQty,
              ...(unitCost > 0 && { unit_cost: newUnitCost }),
              updated_at: new Date(),
            },
          });
        } else {
          await tx.warehouse_stock.create({
            data: {
              warehouse_id: warehouse.warehouse_id,
              product_id: pid,
              quantity: qty,
              unit_cost: unitCost > 0 ? unitCost : undefined,
            },
          });
        }
        transferred += qty;
      }
      return transferred;
    });

    res.json({
      message: 'Transferred company purchases to warehouse',
      transferred: result,
      warehouse_id: warehouse.warehouse_id,
      warehouse_name: warehouse.warehouse_name,
    });
  } catch (error) {
    console.error('transferFromCompanies error:', error);
    res.status(500).json({ message: 'Failed to transfer from companies' });
  }
};

import { Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';

export const getAllStores = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const stores = await prisma.stores.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        store_companies: {
          include: { company: { select: { company_id: true, company_name: true, company_email: true } } },
        },
        store_stock: {
          where: { quantity: { gt: 0 } },
          include: {
            product: {
              select: {
                product_id: true,
                product_code: true,
                product_name: true,
                product_price: true,
              },
            },
          },
          orderBy: { product: { product_name: 'asc' } },
        },
      },
    });
    res.status(200).json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOneStore = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const store = await prisma.stores.findUnique({
      where: { store_id: req.params.id },
      include: {
        store_companies: {
          include: { company: { select: { company_id: true, company_name: true, company_email: true } } },
        },
      },
    });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    res.status(200).json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createStore = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { store_name, description, location, company_ids } = req.body as {
      store_name: string;
      description?: string;
      location?: string;
      company_ids?: string[];
    };
    if (!store_name?.trim()) {
      res.status(400).json({ message: 'Store name is required' });
      return;
    }
    const store = await prisma.stores.create({
      data: {
        store_name: store_name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        ...(Array.isArray(company_ids) && company_ids.length > 0
          ? {
              store_companies: {
                create: company_ids.map((company_id: string) => ({ company_id })),
              },
            }
          : {}),
      },
      include: {
        store_companies: {
          include: { company: { select: { company_id: true, company_name: true } } },
        },
      },
    });
    res.status(201).json(store);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStore = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const store_id = req.params.id;
    const { store_name, description, location, company_ids } = req.body as {
      store_name?: string;
      description?: string;
      location?: string;
      company_ids?: string[];
    };
    const store = await prisma.$transaction(async (tx) => {
      const updated = await tx.stores.update({
        where: { store_id },
        data: {
          ...(store_name !== undefined && { store_name: store_name?.trim() ?? '' }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(location !== undefined && { location: location?.trim() || null }),
        },
      });
      if (Array.isArray(company_ids)) {
        await tx.store_companies.deleteMany({ where: { store_id } });
        if (company_ids.length > 0) {
          await tx.store_companies.createMany({
            data: company_ids.map((company_id: string) => ({ store_id, company_id })),
            skipDuplicates: true,
          });
        }
      }
      return tx.stores.findUnique({
        where: { store_id },
        include: {
          store_companies: {
            include: { company: { select: { company_id: true, company_name: true, company_email: true } } },
          },
        },
      });
    });
    res.status(200).json(store);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteStore = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    await prisma.stores.delete({ where: { store_id: req.params.id } });
    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const linkCompaniesToStore = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const store_id = req.params.id;
    const { company_ids } = req.body as { company_ids: string[] };
    if (!Array.isArray(company_ids)) {
      res.status(400).json({ message: 'company_ids must be an array' });
      return;
    }
    await prisma.store_companies.createMany({
      data: company_ids.map((company_id) => ({ store_id, company_id })),
      skipDuplicates: true,
    });
    // Make existing store_stock sellable for newly linked companies
    for (const company_id of company_ids) {
      await syncMissingStoreStockToCompanyWarehouse(company_id);
    }
    const store = await prisma.stores.findUnique({
      where: { store_id },
      include: {
        store_companies: {
          include: { company: { select: { company_id: true, company_name: true } } },
        },
      },
    });
    res.status(200).json(store);
  } catch (error) {
    console.error('Error linking companies to store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unlinkCompanyFromStore = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { id: store_id, company_id } = req.params;
    await prisma.store_companies.delete({
      where: {
        store_id_company_id: { store_id, company_id },
      },
    });
    res.status(200).json({ message: 'Company unlinked from store' });
  } catch (error) {
    console.error('Error unlinking company from store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/** GET /api/stores/linked-to-company/:companyId - stores linked to this company + products (company's inventory) */
export const getStoresLinkedToCompany = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = req.params.companyId;
    const userCompanyId = (req.user as any)?.company_id;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');

    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    }
    if (!isMainAdmin && userCompanyId !== companyId) {
      res.status(403).json({ message: 'You can only view your own linked stores' });
      return;
    }

    const linkedStores = await prisma.store_companies.findMany({
      where: { company_id: companyId },
      include: {
        store: true,
      },
      orderBy: { store: { store_name: 'asc' } },
    });

    const stores = linkedStores.map((sc) => ({
      store_id: sc.store.store_id,
      store_name: sc.store.store_name,
      description: sc.store.description,
      location: sc.store.location,
    }));

    const storeStockRows = stores.length
      ? await prisma.store_stock.findMany({
          where: {
            store_id: { in: stores.map((s) => s.store_id) },
            quantity: { gt: 0 },
          },
          include: {
            product: {
              select: {
                product_id: true,
                product_code: true,
                product_name: true,
                product_price: true,
                product_cost: true,
              },
            },
          },
          orderBy: { product: { product_name: 'asc' } },
        })
      : [];

    const stockByStore = new Map<string, { stock_id: number; product_id: number; product: any; quantity: number; qty_sold: number }[]>();
    for (const row of storeStockRows) {
      const list = stockByStore.get(row.store_id) ?? [];
      list.push({
        stock_id: row.stock_id,
        product_id: row.product_id,
        product: row.product,
        quantity: Number(row.quantity),
        qty_sold: 0,
      });
      stockByStore.set(row.store_id, list);
    }

    const storesWithStock = stores.map((store) => ({
      ...store,
      products: stockByStore.get(store.store_id) ?? [],
    }));

    const warehouse = await prisma.warehouses.findFirst({
      where: { company_id: companyId, is_active: true },
      include: {
        stock: {
          where: { quantity: { gt: 0 } },
          include: {
            product: {
              select: {
                product_id: true,
                product_code: true,
                product_name: true,
                product_price: true,
                product_cost: true,
              },
            },
          },
        },
      },
    });

    const productsFromStock =
      warehouse?.stock?.map((s) => ({
        stock_id: s.stock_id,
        product_id: s.product_id,
        quantity: s.quantity,
        product: s.product,
      })) ?? [];

    const purchasesWithQty = await prisma.product_purchases.findMany({
      where: {
        purchase_qty: { gt: 0 },
        vendors: { company_id: companyId },
      },
      include: {
        products: {
          select: {
            product_id: true,
            product_code: true,
            product_name: true,
            product_price: true,
            product_cost: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const productMap = new Map<number, { product_id: number; product: any; quantity: number }>();
    for (const s of productsFromStock) {
      productMap.set(s.product_id, {
        product_id: s.product_id,
        product: s.product,
        quantity: Number(s.quantity),
      });
    }
    for (const p of purchasesWithQty) {
      const key = p.product_id;
      if (key == null) continue;
      const existing = productMap.get(key);
      const qty = Number(p.purchase_qty);
      if (!existing) {
        productMap.set(key, {
          product_id: key,
          product: p.products,
          quantity: qty,
        });
      } else {
        existing.quantity += qty;
      }
    }

    // Aggregate qty_sold per product_id (from stock-based and purchase-based sales)
    const soldFromStock = warehouse
      ? await prisma.product_sales.groupBy({
          by: ['stock_id'],
          where: {
            stock_id: { in: warehouse.stock.map((s) => s.stock_id) },
          },
          _sum: { sale_qty: true },
        })
      : [];
    const stockIdToProduct = new Map(
      warehouse?.stock?.map((s) => [s.stock_id, s.product_id]) ?? []
    );
    const soldFromPurchases = await prisma.product_sales.groupBy({
      by: ['purchase_id'],
      where: {
        purchase_id: { not: null },
        product_purchases: {
          vendors: { company_id: companyId },
        },
      },
      _sum: { sale_qty: true },
    });
    const purchaseIdToProduct = new Map(
      (
        await prisma.product_purchases.findMany({
          where: { vendors: { company_id: companyId } },
          select: { purchase_id: true, product_id: true },
        })
      ).map((p) => [p.purchase_id, p.product_id])
    );

    const qtySoldByProduct = new Map<number, number>();
    for (const row of soldFromStock) {
      if (row.stock_id) {
        const pid = stockIdToProduct.get(row.stock_id);
        if (pid) {
          qtySoldByProduct.set(pid, (qtySoldByProduct.get(pid) ?? 0) + Number(row._sum.sale_qty ?? 0));
        }
      }
    }
    for (const row of soldFromPurchases) {
      if (row.purchase_id) {
        const pid = purchaseIdToProduct.get(row.purchase_id);
        if (pid) {
          qtySoldByProduct.set(pid, (qtySoldByProduct.get(pid) ?? 0) + Number(row._sum.sale_qty ?? 0));
        }
      }
    }

    const products = Array.from(productMap.values()).map(({ product_id, product, quantity }) => ({
      product_id,
      product,
      quantity,
      qty_sold: qtySoldByProduct.get(product_id) ?? 0,
    }));

    const assignedProducts = storesWithStock.flatMap((store) => store.products);
    const visibleProducts = assignedProducts.length > 0 ? assignedProducts : products;

    res.status(200).json({
      stores: storesWithStock,
      products: visibleProducts,
    });
  } catch (error) {
    console.error('Error fetching linked stores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/** GET /api/stores/company/:companyId/inventory - all items in the company's store (warehouse_stock), no company filter on items */
export const getCompanyInventory = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const searchTerm = (req.query.search as string) || '';

    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    }

    // Sync any "Already in store" products not yet mirrored into warehouse_stock (sellable)
    await syncMissingStoreStockToCompanyWarehouse(companyId);

    // 1) Get warehouses that belong to this company (their store)
    const companyWarehouses = await prisma.warehouses.findMany({
      where: { company_id: companyId, is_active: true },
      select: { warehouse_id: true },
    });
    let warehouseIds = companyWarehouses.map((w) => w.warehouse_id);

    // 2) If no warehouse by company_id, use warehouses that are transfer destinations for this company
    if (warehouseIds.length === 0) {
      const transferDests = await prisma.warehouse_transfers.findMany({
        where: { company_id: companyId, status: 'COMPLETED', to_warehouse_id: { not: null } },
        select: { to_warehouse_id: true },
        distinct: ['to_warehouse_id'],
      });
      warehouseIds = transferDests.map((t) => t.to_warehouse_id!).filter(Boolean);
    }

    if (warehouseIds.length === 0) {
      res.status(200).json({ data: [], total: 0 });
      return;
    }

    // 3) Build where clause with search filter
    const whereClause: any = {
      warehouse_id: { in: warehouseIds },
      quantity: { gt: 0 },
    };

    // Add search filter if search term provided (search by product_code or product_name)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.trim().toLowerCase();
      // Use Prisma's nested filter for relation
      whereClause.product = {
        OR: [
          { product_code: { contains: searchTerm.trim(), mode: 'insensitive' } },
          { product_name: { contains: searchTerm.trim(), mode: 'insensitive' } },
        ],
      };
    }

    // 4) Get stock in those warehouses with search filter
    const stock = await prisma.warehouse_stock.findMany({
      where: whereClause,
      include: {
        product: true,
      },
      orderBy: { stock_id: 'desc' },
    });

    const inventoryItems = stock.map((s) => ({
      stock_id: s.stock_id,
      product_id: s.product_id,
      quantity: s.quantity,
      created_at: s.created_at,
      updated_at: s.updated_at,
      product: s.product,
    }));

    res.status(200).json({
      data: inventoryItems,
      total: inventoryItems.length,
    });
  } catch (error) {
    console.error('Error fetching company inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const isMainAdminUser = (req: CustomUserRequest): boolean => {
  const roles: string[] = (req.user as any)?.roles || [];
  return roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin');
};

/** Find or create the company's default active warehouse (needed so store_stock can be sold). */
async function ensureCompanyWarehouse(companyId: string, tx: typeof prisma = prisma) {
  let warehouse = await tx.warehouses.findFirst({
    where: { company_id: companyId, is_active: true },
    orderBy: [{ is_default: 'desc' }, { warehouse_id: 'asc' }],
  });
  if (!warehouse) {
    warehouse = await tx.warehouses.create({
      data: {
        warehouse_name: 'Store',
        company_id: companyId,
        is_default: true,
        is_active: true,
      },
    });
  }
  return warehouse;
}

/**
 * Add quantity to a company's warehouse_stock (sales path).
 * Used when admin adds "Already in store" products so they become sellable.
 */
async function addQtyToCompanyWarehouse(
  companyId: string,
  productId: number,
  qty: number,
  unitCost?: number | null,
  tx: typeof prisma = prisma
) {
  const warehouse = await ensureCompanyWarehouse(companyId, tx);
  const existing = await tx.warehouse_stock.findUnique({
    where: {
      warehouse_id_product_id: {
        warehouse_id: warehouse.warehouse_id,
        product_id: productId,
      },
    },
  });
  const incomingCost = unitCost != null && !Number.isNaN(Number(unitCost)) && Number(unitCost) >= 0
    ? Number(unitCost)
    : 0;

  if (existing) {
    const existingQty = Number(existing.quantity);
    const existingCost = Number(existing.unit_cost ?? 0);
    const newQty = existingQty + qty;
    const newUnitCost =
      newQty > 0 && (incomingCost > 0 || existingCost > 0)
        ? (existingQty * existingCost + qty * incomingCost) / newQty
        : undefined;
    return tx.warehouse_stock.update({
      where: { stock_id: existing.stock_id },
      data: {
        quantity: newQty,
        ...(newUnitCost != null && { unit_cost: newUnitCost }),
        updated_at: new Date(),
      },
    });
  }

  return tx.warehouse_stock.create({
    data: {
      warehouse_id: warehouse.warehouse_id,
      product_id: productId,
      quantity: qty,
      ...(incomingCost > 0 && { unit_cost: incomingCost }),
    },
  });
}

/**
 * Ensure store_stock products exist on company warehouse_stock (create missing only — no double-add).
 * Makes previously added "Already in store" items sellable.
 */
async function syncMissingStoreStockToCompanyWarehouse(companyId: string) {
  const linkedStoreIds = (
    await prisma.store_companies.findMany({
      where: { company_id: companyId },
      select: { store_id: true },
    })
  ).map((r) => r.store_id);

  if (linkedStoreIds.length === 0) return;

  const assigned = await prisma.store_stock.findMany({
    where: { store_id: { in: linkedStoreIds }, quantity: { gt: 0 } },
    include: { product: { select: { product_id: true, product_cost: true } } },
  });
  if (assigned.length === 0) return;

  const warehouse = await ensureCompanyWarehouse(companyId);
  const existing = await prisma.warehouse_stock.findMany({
    where: { warehouse_id: warehouse.warehouse_id },
    select: { product_id: true },
  });
  const haveProduct = new Set(existing.map((e) => e.product_id));

  // Aggregate by product in case same product is on multiple linked stores
  const byProduct = new Map<number, { qty: number; cost: number }>();
  for (const row of assigned) {
    if (haveProduct.has(row.product_id)) continue;
    const prev = byProduct.get(row.product_id);
    const qty = Number(row.quantity) || 0;
    const cost = Number(row.product?.product_cost ?? 0) || 0;
    if (prev) {
      byProduct.set(row.product_id, { qty: prev.qty + qty, cost: prev.cost || cost });
    } else {
      byProduct.set(row.product_id, { qty, cost });
    }
  }

  for (const [productId, { qty, cost }] of byProduct) {
    if (qty <= 0) continue;
    await prisma.warehouse_stock.create({
      data: {
        warehouse_id: warehouse.warehouse_id,
        product_id: productId,
        quantity: qty,
        ...(cost > 0 && { unit_cost: cost }),
      },
    });
    haveProduct.add(productId);
  }
}

/** GET /api/stores/:id/stock - products currently held by this store */
export const getStoreStock = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const store_id = req.params.id;
    const store = await prisma.stores.findUnique({ where: { store_id } });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    const rows = await prisma.store_stock.findMany({
      where: { store_id, quantity: { gt: 0 } },
      include: { product: true },
      orderBy: { product: { product_name: 'asc' } },
    });
    res.status(200).json({ data: rows, total: rows.length });
  } catch (error) {
    console.error('Error fetching store stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/** POST /api/stores/:id/stock - admin only. Adds an existing product into this store. */
export const addStoreStock = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!isMainAdminUser(req)) {
      res.status(403).json({ message: 'Only admin can add products to a store' });
      return;
    }

    const store_id = req.params.id;
    const productId = parseInt(String(req.body.product_id), 10);
    const qty = parseFloat(String(req.body.quantity ?? '').replace(',', '.'));

    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      res.status(400).json({ message: 'Select a product and a quantity greater than 0' });
      return;
    }

    const store = await prisma.stores.findUnique({ where: { store_id } });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    const product = await prisma.products.findUnique({ where: { product_id: productId } });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const unitCost = product.product_cost != null ? Number(product.product_cost) : 0;

    const stock = await prisma.$transaction(async (tx) => {
      const existing = await tx.store_stock.findUnique({
        where: { store_id_product_id: { store_id, product_id: productId } },
      });

      const row = existing
        ? await tx.store_stock.update({
            where: { stock_id: existing.stock_id },
            data: { quantity: Number(existing.quantity) + qty },
            include: { product: true },
          })
        : await tx.store_stock.create({
            data: { store_id, product_id: productId, quantity: qty },
            include: { product: true },
          });

      // Mirror into linked companies' warehouse_stock so sales can deduct stock_id
      const linked = await tx.store_companies.findMany({
        where: { store_id },
        select: { company_id: true },
      });
      for (const { company_id } of linked) {
        await addQtyToCompanyWarehouse(company_id, productId, qty, unitCost, tx as typeof prisma);
      }

      return row;
    });

    res.status(201).json(stock);
  } catch (error) {
    console.error('Error adding store stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

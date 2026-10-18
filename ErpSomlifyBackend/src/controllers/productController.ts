// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, get, post, put, del, use, bodyValidator, queryValidator, lengthValidator } from "../decorators";
// import { requestMustBeArray } from "../middlewares/common";

// @controller('/api')
// class ProductController {
//   @get('/products')
//   @queryValidator('company_id')
//   async findAll (req: Request, res: Response) {
//     const products = await prisma.products.findMany({
//       where: {
//         company_id: String(req.query.company_id)
//       }
//     });
//     res.status(200).send(products);
//   }
//   @get('/products/:id')
//   async findOne (req: Request, res: Response) {
//     const product = await prisma.products.findUnique({
//       where: { product_id: parseInt(req.params.id) }
//     })
//     res.status(200).send(product);
//   }
//   @post('/products')
//   @bodyValidator('product_code', 'product_name', 'product_cost', 'product_price', 'company_id', 'product_alert_number')
//   @lengthValidator(22, 'product_code', 'product_name')
//   @use(requestMustBeArray)
//   async create (req: Request, res: Response) {
//     const product = await prisma.products.createMany({
//       data: req.body
//     })
//     res.status(201).send(product);
//   }
//   @put('/products/:id')
//   @bodyValidator('product_code', 'product_name', 'product_cost', 'product_price', 'product_alert_number')
//   @lengthValidator(22, 'product_code', 'product_name')
//   async update (req: Request, res: Response) {
//     const { product_code, product_name, product_cost, product_price, product_alert_number } = req.body;
//     const updatedProduct = await prisma.products.update({
//       where: { product_id: parseInt(req.params.id) },
//       data: {
//         product_code,
//         product_name,
//         product_cost,
//         product_price,
//         product_alert_number,
//         updated_at: new Date()
//       }
//     })
//     res.status(200).send(updatedProduct);
//   }
//   @del('/products/:id')
//   async delete (req: Request, res: Response) {
//     const deletedProduct = await prisma.products.delete({
//       where: { product_id: parseInt(req.params.id) }
//     })
//     res.status(204).send({ message: 'Deleted successfully'})
//   }
// }






// export const getAllProducts = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
    
//     const products = await prisma.products.findMany({
//       where: { company_id: req.user!.company_id }
//     });
//     res.status(200).json(products);
//   } catch (error) {
//     console.error(`Error fetching products: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';

/** Aligned with Prisma `products` model (@db.VarChar) */
const MAX_PRODUCT_CODE_LEN = 255;
const MAX_PRODUCT_NAME_LEN = 255;
const MAX_CATEGORY_LEN = 100;
const MAX_DESCRIPTION_LEN = 500;

function normStr(v: unknown): string {
  return String(v ?? '').trim();
}

const PRODUCT_SORT_FIELDS = [
  'product_code',
  'product_name',
  'product_price',
  'product_alert_number',
  'created_at',
] as const;

type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

function productOrderBy(sortBy: string, sortOrder: string) {
  const field = PRODUCT_SORT_FIELDS.includes(sortBy as ProductSortField)
    ? (sortBy as ProductSortField)
    : null;
  const direction: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';
  if (!field) {
    return [{ created_at: 'desc' as const }, { product_id: 'desc' as const }];
  }
  return [{ [field]: direction }, { product_id: 'desc' as const }];
}

function likePattern(search: string) {
  return `%${search.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

/** Tracking numbers are text, so "10" would sort before "2". Compare the digits as a number. */
async function productIdsByTrackingNumber(
  search: string,
  direction: 'asc' | 'desc',
  skip: number,
  take: number,
) {
  const sqlDir = Prisma.raw(direction === 'desc' ? 'DESC' : 'ASC');
  const where = search
    ? Prisma.sql`WHERE product_name ILIKE ${likePattern(search)} ESCAPE '\\' OR product_code ILIKE ${likePattern(search)} ESCAPE '\\'`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<{ product_id: number }[]>`
    SELECT product_id
    FROM products
    ${where}
    ORDER BY
      NULLIF(regexp_replace(product_code, '[^0-9]', '', 'g'), '')::numeric ${sqlDir} NULLS LAST,
      product_code ${sqlDir},
      product_id ${sqlDir}
    LIMIT ${take}
    OFFSET ${skip}
  `;
  return rows.map((row) => Number(row.product_id));
}

export const getAllProducts = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = req.query.search as string || '';
    const sortBy = String(req.query.sortBy || '');
    const sortOrder = String(req.query.sortOrder || '');
    const skip = (page - 1) * pageSize;

    const searchCondition = [
      { product_name: { contains: search, mode: 'insensitive' as const } },
      { product_code: { contains: search, mode: 'insensitive' as const } }
    ];
    const where = search ? { OR: searchCondition } : {};
    const orderBy = productOrderBy(sortBy, sortOrder);
    const direction: 'asc' | 'desc' = sortOrder === 'desc' ? 'desc' : 'asc';

    const total = await prisma.products.count({ where });
    let products;
    if (sortBy === 'product_code') {
      const ids = await productIdsByTrackingNumber(search, direction, skip, pageSize);
      const rows = ids.length
        ? await prisma.products.findMany({ where: { product_id: { in: ids } } })
        : [];
      const rank = new Map(ids.map((id, index) => [id, index]));
      products = rows.sort((a, b) => (rank.get(a.product_id) ?? 0) - (rank.get(b.product_id) ?? 0));
    } else {
      products = await prisma.products.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      });
    }

    const hasMore = skip + pageSize < total;

    res.status(200).json({
      data: products,
      total,
      page,
      pageSize,
      hasMore
    });
  } catch (error) {
    console.error(`Error fetching products: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProduct = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.products.findUnique({
      where: { product_id: parseInt(req.params.id) }
    });
    product ? res.status(200).json(product) : res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    console.error(`Error fetching product: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProducts = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ message: 'Request body must be an array' });
      return;
    }

    const productData = req.body.map((product: any) => {
      const cost = product.product_cost != null && product.product_cost !== '' ? Number(product.product_cost) : null;
      const categoryRaw = normStr(product.category);
      const descriptionRaw = normStr(product.description);
      return {
        product_code: normStr(product.product_code),
        product_name: normStr(product.product_name),
        product_cost: cost != null && !isNaN(cost) ? cost : null,
        product_price: product.product_price,
        product_alert_number: product.product_alert_number ?? 30,
        category: categoryRaw === '' ? null : categoryRaw,
        description: descriptionRaw === '' ? null : descriptionRaw,
      };
    });

    for (const product of productData) {
      if (!product.product_code || !product.product_name ||
          product.product_price == null || product.product_price === '' || product.product_alert_number == null) {
        res.status(400).json({ message: 'Missing required fields in one or more products (code, name, price, alert number)' });
        return;
      }
      if (product.product_code.length > MAX_PRODUCT_CODE_LEN || product.product_name.length > MAX_PRODUCT_NAME_LEN) {
        res.status(400).json({
          message: `Product code and name must be at most ${MAX_PRODUCT_CODE_LEN} characters each.`,
        });
        return;
      }
      if (product.category && product.category.length > MAX_CATEGORY_LEN) {
        res.status(400).json({ message: `Category must be at most ${MAX_CATEGORY_LEN} characters.` });
        return;
      }
      if (product.description && product.description.length > MAX_DESCRIPTION_LEN) {
        res.status(400).json({ message: `Description must be at most ${MAX_DESCRIPTION_LEN} characters.` });
        return;
      }
      if (product.product_cost != null && isNaN(Number(product.product_cost))) {
        res.status(400).json({ message: 'Product cost must be a valid number when provided' });
        return;
      }
      if (isNaN(Number(product.product_price)) || isNaN(Number(product.product_alert_number))) {
        res.status(400).json({ message: 'Price and alert number must contain valid numbers' });
        return;
      }
    }

    const createdProducts = await prisma.products.createMany({ data: productData });
    res.status(201).json(createdProducts);
  } catch (error) {
    console.error(`Error creating products: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// export const updateProduct = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     const { product_code, product_name, product_cost, product_price, product_alert_number } = req.body;
//     if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
//       res.status(403).json({ message: 'Forbidden' });
//       return;
//     }
    
//     if (!product_code || !product_name || !product_cost || !product_price || !product_alert_number) {
//       res.status(400).json({ message: 'Missing required fields' });
//       return;
//     }

//     if ([product_code, product_name].some(field => field.length > 22)) {
//       res.status(400).json({ message: 'Field exceeds 22 character limit' });
//       return;
//     }

//     if (isNaN(product_cost) || isNaN(product_price) || isNaN(product_alert_number)) {
//       res.status(400).json({ message: 'Numerical fields must contain valid numbers' });
//       return;
//     }

//     const updatedProduct = await prisma.products.update({
//       where: { 
//         product_id: parseInt(req.params.id),
//         company_id: req.user!.company_id 
//       },
//       data: { 
//         ...req.body,
//         updated_at: new Date()
//       }
//     });
//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     console.error(`Error updating product: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const updateProduct = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { product_cost, product_price, product_alert_number } = req.body;
    const product_code = normStr(req.body.product_code);
    const product_name = normStr(req.body.product_name);

    if (!product_code || !product_name || product_price == null || product_price === '' || product_alert_number == null || product_alert_number === '') {
      res.status(400).json({ message: 'Missing required fields (code, name, price, alert number)' });
      return;
    }

    if (product_code.length > MAX_PRODUCT_CODE_LEN || product_name.length > MAX_PRODUCT_NAME_LEN) {
      res.status(400).json({
        message: `Product code and name must be at most ${MAX_PRODUCT_CODE_LEN} characters each.`,
      });
      return;
    }

    const priceNum = Number(product_price);
    const alertNum = Number(product_alert_number);
    if (isNaN(priceNum) || isNaN(alertNum)) {
      res.status(400).json({ message: 'Price and alert number must be valid numbers' });
      return;
    }
    const costNum = product_cost != null && product_cost !== '' ? Number(product_cost) : null;
    if (costNum != null && isNaN(costNum)) {
      res.status(400).json({ message: 'Product cost must be a valid number when provided' });
      return;
    }

    const productId = parseInt(req.params.id);

    const { category, description } = req.body;
    let categoryVal: string | null | undefined;
    let descriptionVal: string | null | undefined;
    if (category !== undefined) {
      const c = normStr(category);
      categoryVal = c === '' ? null : c;
      if (categoryVal && categoryVal.length > MAX_CATEGORY_LEN) {
        res.status(400).json({ message: `Category must be at most ${MAX_CATEGORY_LEN} characters.` });
        return;
      }
    }
    if (description !== undefined) {
      const d = normStr(description);
      descriptionVal = d === '' ? null : d;
      if (descriptionVal && descriptionVal.length > MAX_DESCRIPTION_LEN) {
        res.status(400).json({ message: `Description must be at most ${MAX_DESCRIPTION_LEN} characters.` });
        return;
      }
    }

    const updatedProduct = await prisma.products.update({
      where: { product_id: productId },
      data: { 
        product_code,
        product_name,
        product_cost: costNum,
        product_price: priceNum,
        product_alert_number: alertNum,
        category: categoryVal !== undefined ? categoryVal : undefined,
        description: descriptionVal !== undefined ? descriptionVal : undefined,
        updated_at: new Date()
      }
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const deleteProduct = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    // Check if product exists
    const product = await prisma.products.findUnique({ where: { product_id: productId } });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check for related records that block deletion
    const [purchaseCount, salesCount] = await Promise.all([
      prisma.product_purchases.count({ where: { product_id: productId } }),
      prisma.product_sales.count({
        where: {
          product_purchases: { product_id: productId },
        },
      }).catch(() => 0),
    ]);

    if (purchaseCount > 0) {
      res.status(400).json({ message: 'Product cannot be deleted because it has purchase records. Remove purchases first.' });
      return;
    }

    // Delete in transaction: clean up warehouse stock, transfers, invoice items, then product
    await prisma.$transaction(async (tx) => {
      // Remove warehouse transfers for this product
      await tx.warehouse_transfers.deleteMany({ where: { product_id: productId } });

      // Remove warehouse stock for this product
      await tx.warehouse_stock.deleteMany({ where: { product_id: productId } });

      // Remove invoice items linked to this product
      await tx.invoiceItem.deleteMany({ where: { product_id: productId } });

      // Delete the product
      await tx.products.delete({ where: { product_id: productId } });
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`Error deleting product: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
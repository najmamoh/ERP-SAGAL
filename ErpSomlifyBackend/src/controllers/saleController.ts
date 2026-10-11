// import { Request, response, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, post, put, del, use, bodyValidator, lengthValidator } from "../decorators";
// import { requestMustBeArray, checkSalesHasSamePurchaseId } from "../middlewares";

// enum ProductSales {
//   new_sale_qty = 'new_sale_qty',
//   sale_qty = 'sale_qty',
//   item_price = 'item_price',
//   sale_discount = 'sale_discount',
//   received_amount = 'received_amount',
//   taxable_sale = 'taxable_sale',
//   customer_id = 'customer_id',
//   purchase_id = 'purchase_id',
//   company_id = 'company_id'
// }

// interface Customer {
//   sale_qty: number;
//   item_price: string;
//   sale_discount: string;
//   received_amount: string;
//   taxable_sale?: any;
//   product_purchases: any;
//   customers?: any;
//   updated_at?: Date;
//   created_at?: Date;
// }

// interface Product {
//   purchase_id: number;
//   purchase_qty: number;
//   products?: {
//     companies: {
//       tax_percentage: number;
//     }
//   }
// }

// interface Sale {
//   sale_qty: number;
//   product_purchases?: {
//     purchase_id: number;
//     purchase_qty: number;
//   }
// }

// @controller('/api')
// class SaleController {
//  @post('/sales')
//  @bodyValidator(ProductSales.sale_qty, ProductSales.item_price, ProductSales.sale_discount, ProductSales.received_amount, ProductSales.purchase_id, ProductSales.taxable_sale)
//  @lengthValidator(255, ProductSales.sale_qty, ProductSales.item_price, ProductSales.sale_discount, ProductSales.received_amount, ProductSales.purchase_id)
//  @use(checkSalesHasSamePurchaseId)
//  @use(requestMustBeArray)
//  async create (req: any, res: Response) {
//    const purchase: Product = await prisma.product_purchases.findUnique({
//      where: { purchase_id: req.body[0].purchase_id },
//      include: {
//        products: {
//          include: {
//            companies: true
//          }
//        }
//      }
//    }) || { purchase_id: 0, purchase_qty: 0, products: { companies: { tax_percentage: 5 } } };
   
//    // check if quantity is available
//    if (!purchase || (purchase && purchase.purchase_qty < req.totalSaleQty)) {
//      return res.status(400).send({ message: `Unavailable quantity. ${purchase.purchase_qty} quantitities are remaining.` })
//    }

//    for (const sale of req.body) {
//     const { sale_qty, item_price, sale_discount, received_amount, customer_id, purchase_id, taxable_sale } = sale;
//     // check that customer is availabe when payment is 100% cash
//     const taxPercentage = purchase.products?.companies.tax_percentage || 5;
//     const saleAmount = sale_qty * item_price + (taxable_sale ? sale_qty * item_price * (taxPercentage / 100) : 0);

//     const saleHasCredit = saleAmount - received_amount - sale_discount > 0;
//     if (saleHasCredit && customer_id === undefined) {
//       return res.status(400).send({ message: 'Customer needed when sale is not %100 cash' })
//     }

//     // register the sale
//     const data: Customer = {
//       sale_qty, 
//       item_price, 
//       sale_discount, 
//       received_amount,
//       taxable_sale: sale.taxable_sale || false,
//       product_purchases: {
//         connect: { purchase_id }
//       }
//     }
//     // add customer to the data if customer exists
//     if (customer_id) {
//       data.customers = {
//         connect: { customer_id }
//       }
//     }
//     // register the sale to the databse
//     const newSale = await prisma.product_sales.create({ data });
//     // deduct the sold quantity to the inventory
//     purchase.purchase_qty -= sale.sale_qty;
//    }
   
//   //  update product quantity
//    await prisma.product_purchases.update({
//      where: {
//        purchase_id: purchase.purchase_id
//      },
//      data: {
//        purchase_qty: purchase.purchase_qty
//      }
//    })
//   res.status(201).send(req.body);
//  }
//  @put('/sales/:id')
//  @bodyValidator(ProductSales.new_sale_qty, ProductSales.item_price, ProductSales.sale_discount, ProductSales.received_amount, ProductSales.taxable_sale)
//  @lengthValidator(255, ProductSales.new_sale_qty, ProductSales.item_price, ProductSales.sale_discount, ProductSales.received_amount)
//  async update (req: Request, res: Response) {
//   const { new_sale_qty, item_price, sale_discount, received_amount, taxable_sale } = req.body;

//   const sale: Sale | { } = await prisma.product_sales.findUnique({
//     where: { sale_id: Number(req.params.id)},
//     include: {
//       product_purchases: {
//         include: { products: {
//           include: { companies: true }
//         }}
//       }
//     }
//   }) || { product_purchases: { purchase_qty: 0 } }
  
//   // calculate new product quantity
//   let difference: undefined | number;
//   let oldSaleQuantity = 0;
//   let oldPurchaseQuantity = 0;
//   let newPurchaseQuantity = -1;
//   if ('sale_qty' in sale && 'product_purchases' in sale) {
//      difference = sale?.sale_qty - new_sale_qty;
//      oldSaleQuantity = sale?.sale_qty;
//      oldPurchaseQuantity = sale.product_purchases?.purchase_qty !== undefined ? sale.product_purchases.purchase_qty : 0;
//      newPurchaseQuantity =  oldPurchaseQuantity + difference;
//   } else {
//     res.status(400).send({ message: "sale not found" })
//   }

//   // check if quantity is available
//   if (newPurchaseQuantity < 0) {
//     res.status(400).send({ message: `Unavailable quantity. ${oldPurchaseQuantity + oldSaleQuantity} quantities are remaining.` })
//   }

//   // update the sale
//   const updatedSale = await prisma.product_sales.update({
//     where: { sale_id: parseInt(req.params.id)},
//     data: {
//       sale_qty: new_sale_qty,
//       item_price,
//       sale_discount,
//       received_amount,
//       updated_at: new Date(),
//       product_purchases: {
//         update: {
//           data: {
//             purchase_qty: newPurchaseQuantity
//           }
//         }
//       }
//     }
//   })
//   res.status(200).send(updatedSale);
//  }
//  @del('/sales/:id')
//  async delete (req: Request, res: Response) {
//    const deletedSale: Sale = await prisma.product_sales.delete({
//      where: { sale_id: parseInt(req.params.id) },
//      include: { product_purchases: true }
//    })
//    if ('product_purchases' in deletedSale) {
//      const sale_qty = deletedSale.sale_qty;
//      const purchase_id = deletedSale.product_purchases?.purchase_id;
//      const purchase_qty = deletedSale.product_purchases?.purchase_qty || 0;
//      const newPurchaseQuantity = purchase_qty + sale_qty;
//      await prisma.product_purchases.update({
//        where: { purchase_id },
//        data: { purchase_qty: newPurchaseQuantity }
//      })
//    }
//    res.status(204).send({ message: 'Deleted Successfully'})
//  } 
// }


// src/controllers/sales.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { Prisma, TransactionAuditType, TransactionCategory } from '@prisma/client';
import { TreasuryService } from "../services/TreasuryService";

// Updated controller - include both purchase-based sales (vendors.company_id) and company store sales (sold_by user's company_id)
export const getAllSales = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const search = (req.query.search as string)?.trim() || '';
    const userCompanyId = (req.user as any)?.company_id;
    const companyIdFilter = req.query.company_id as string | undefined;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    const companyId = companyIdFilter || userCompanyId;

    const where: any = {};
    if (companyId) {
      // Sales from company's purchases OR sales made by company users (company store sales)
      where.OR = [
        { product_purchases: { vendors: { company_id: companyId } } },
        { company_users: { company_id: companyId } },
      ];
    } else if (!isMainAdmin) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    }

    if (search) {
      const searchOr: any[] = [
        { product_purchases: { products: { product_name: { contains: search, mode: 'insensitive' } } } },
        { warehouse_stock: { product: { product_name: { contains: search, mode: 'insensitive' } } } },
        { warehouse_stock: { product: { product_code: { contains: search, mode: 'insensitive' } } } },
        { company_users: { full_name: { contains: search, mode: 'insensitive' } } },
      ];
      if (!isNaN(Number(search))) searchOr.push({ sale_id: Number(search) });
      where.AND = [...(where.AND || []), { OR: searchOr }];
    }

    const sales = await prisma.product_sales.findMany({
      where,
      include: {
        product_purchases: {
          include: {
            products: true,
            vendors: { include: { companies: { select: { company_name: true } } } }
          }
        },
        warehouse_stock: { include: { product: true } },
        customers: true,
        company_users: {
          include: { companies: { select: { company_name: true } } }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    const toNum = (v: unknown): number => {
      if (v == null) return 0;
      if (typeof v === 'number') return v;
      if (typeof v === 'object' && v !== null && '$numberDecimal' in v) return parseFloat((v as any).$numberDecimal) || 0;
      return parseFloat(String(v).replace(',', '.')) || 0;
    };

    // Group by invoice: each invoice = one transaction (one "Complete sale"). product_sales.created_at is Date-only so we use invoice boundaries.
    const saleIds = sales.map((s) => s.sale_id as number).filter((id) => id != null);
    const invoiceStarts = saleIds.length
      ? (
          await prisma.invoice.findMany({
            where: { sale_id: { in: saleIds } },
            select: { sale_id: true },
            orderBy: { sale_id: 'asc' },
          })
        ).map((inv) => inv.sale_id!)
      : [];
    const firstSaleIdSet = new Set(invoiceStarts);

    const sortedBySaleId = [...sales].sort((a, b) => (a.sale_id as number) - (b.sale_id as number));
    const transactionGroups: any[][] = [];

    for (const sale of sortedBySaleId) {
      const sid = sale.sale_id as number;
      // Transaction "first" = largest invoice sale_id <= this sale_id (this sale belongs to that invoice's transaction)
      const transactionFirst = invoiceStarts.filter((f) => f <= sid).pop();
      const lastGroup = transactionGroups[transactionGroups.length - 1];
      const lastGroupTransactionFirst =
        lastGroup?.length
          ? invoiceStarts.filter((f) => f <= (lastGroup[0] as any).sale_id).pop()
          : undefined;

      if (lastGroup && lastGroup.length > 0 && lastGroupTransactionFirst === transactionFirst) {
        lastGroup.push(sale);
      } else {
        transactionGroups.push([sale]);
      }
    }

    const formatted = transactionGroups.map((group) => {
      const first = group[0];
      const products: string[] = [];
      let totalQty = 0;
      let totalPrice = 0;
      let totalDiscount = 0;
      let totalReceived = 0;
      let companyName = '';

      group.forEach((s) => {
        const qty = toNum(s.sale_qty);
        const price = toNum(s.item_price);
        totalQty += qty;
        totalPrice += qty * price;
        totalDiscount += toNum(s.sale_discount);
        totalReceived += toNum(s.received_amount);
        let pname = '';
        if (s.product_purchases?.products) pname = (s.product_purchases.products as any).product_name || '';
        else if (s.warehouse_stock?.product) pname = (s.warehouse_stock.product as any).product_name || '';
        if (pname) products.push(`${pname} (${qty}x)`);
        if (!companyName) {
          const v = s.product_purchases as any;
          const cu = s.company_users as any;
          if (v?.vendors?.companies?.company_name) companyName = v.vendors.companies.company_name;
          else if (cu?.companies?.company_name) companyName = cu.companies.company_name;
        }
      });

      // All product names for this sale (multi-product = comma-separated, e.g. "airpods (1x), iphone15 (1x)")
      const productNameList = products.length > 0 ? products.join(', ') : 'N/A';

      return {
        ...first,
        product_name: productNameList,
        sale_qty: totalQty,
        item_price: String((totalPrice > 0 ? totalPrice : toNum(first.item_price) * (toNum(first.sale_qty) || 1)).toFixed(2)),
        sale_discount: String(totalDiscount.toFixed(2)),
        received_amount: String(totalReceived.toFixed(2)),
        company_name: companyName || (first.product_purchases as any)?.vendors?.companies?.company_name || (first.company_users as any)?.companies?.company_name || 'N/A',
      };
    });

    // Newest transactions first (group anchor = smallest sale_id in transaction; higher = newer)
    formatted.sort((a, b) => Number(b.sale_id) - Number(a.sale_id));

    const total = formatted.length;
    const paginatedData = formatted.slice(skip, skip + pageSize);

    res.status(200).json({
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error(`Error fetching sales: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const userCompanyId = (req.user as any)?.company_id;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    const where: any = { sale_id: parseInt(req.params.id) };
    if (userCompanyId && !isMainAdmin) {
      where.OR = [
        { product_purchases: { vendors: { company_id: userCompanyId } } },
        { company_users: { company_id: userCompanyId } },
      ];
    }

    const sale = await prisma.product_sales.findFirst({
      where,
      include: {
        product_purchases: {
          include: { products: true }
        },
        warehouse_stock: { include: { product: true } },
        customers: true,
        company_users: true,
      }
    });
    sale ? res.status(200).json(sale) : res.status(404).json({ message: 'Sale not found' });
  } catch (error) {
    console.error(`Error fetching sale: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// export const createSales = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     // Authorization check
//     if (!req.user!.roles?.includes('admin') && !req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
//       res.status(403).json({ message: 'Forbidden! You don\'t have permission' });
//       return;
//     }
    
//     const salesData = Array.isArray(req.body) ? req.body : [req.body];
//     let totalSaleQty = 0;

//     // Validate all sales first
//     for (const sale of salesData) {
//       const { purchase_id, sale_qty, item_price, sale_discount, received_amount, customer_id, taxable_sale } = sale;
      
//       if (!purchase_id || !sale_qty || !item_price || !sale_discount || !received_amount) {
//         res.status(400).json({ message: 'Missing required fields' });
//         return;
//       }

//       const stringFields = [
//         sale_qty.toString(),
//         item_price.toString(),
//         sale_discount.toString(),
//         received_amount.toString()
//       ];
//       if (stringFields.some(field => field.length > 255)) {
//         res.status(400).json({ message: 'Field exceeds 255 character limit' });
//         return;
//       }
       
//       if(Number(received_amount) > Number(item_price) * Number(sale_qty)) {
//         res.status(400).json({message: `Received Amount cannot exceed Item Price: ${item_price}`})
//         return;
//       }

//       if (Number(sale_discount) > (Number(item_price) * Number(sale_qty) - Number(received_amount))) {
//         res.status(400).json({ 
//           message: `Sale discount cannot exceed ${Number(item_price) * Number(sale_qty) - Number(received_amount)}` 
//         });
//         return;
//       }

//       if (Number(sale_qty) < 0 || Number(item_price) < 0 || Number(sale_discount) < 0 || Number(received_amount) < 0) {
//         res.status(400).json({ message: 'Values cannot be negative' });
//         return;
//       }

//       totalSaleQty += Number(sale_qty);
//     }

//     const purchaseId = salesData[0].purchase_id;
//     const purchase = await prisma.product_purchases.findUnique({
//       where: { purchase_id: purchaseId },
//       include: { products: { include: { companies: true } } }
//     });
     

//     const taxPercentage = purchase!.products!.companies!.tax_percentage;
//     if (!purchase || purchase.purchase_qty < totalSaleQty) {
//       const available = purchase?.purchase_qty ?? 0;
//       res.status(400).json({ message: `Unavailable quantity. ${available} quantities remaining.` });
//       return;
//     }

//     const createdSales = [];
//     for (const sale of salesData) {
//       const { sale_qty, item_price:originalItemPrice, sale_discount, received_amount, customer_id, taxable_sale } = sale;
//       const taxPercentage = purchase.products!.companies!.tax_percentage;

//       // Calculate financial values
//       let adjustedItemPrice = new Prisma.Decimal(originalItemPrice);
//       if (taxable_sale) {
//         const taxToAdd = adjustedItemPrice.mul(new Prisma.Decimal(taxPercentage!)).div(100);
//         adjustedItemPrice = adjustedItemPrice.plus(taxToAdd);
//       }
      
//       const subtotal = new Prisma.Decimal(sale_qty).times(adjustedItemPrice);
//       const taxAmount = taxable_sale 
//         ? new Prisma.Decimal(originalItemPrice).mul(sale_qty).mul(taxPercentage!).div(100)
//         : new Prisma.Decimal(0);
//       const totalBeforeDiscount = subtotal.plus(taxAmount);
//       const totalAfterDiscount = totalBeforeDiscount.minus(new Prisma.Decimal(sale_discount));
//       const receivedDecimal = new Prisma.Decimal(received_amount);
//       const totalAmount= subtotal.minus(new Prisma.Decimal(sale_discount));

//       // Determine invoice status
//       let status: 'PAID' | 'ISSUED' | 'PARTIAL';
//       if (receivedDecimal.gte(totalAfterDiscount)) {
//         status = 'PAID';
//       } else if (receivedDecimal.equals(0)) {
//         status = 'ISSUED';
//       } else {
//         status = 'PARTIAL';
//       }

//       const saleData = {
//         sale_qty: Number(sale_qty),
//         item_price: adjustedItemPrice,
//         sale_discount: new Prisma.Decimal(sale_discount),
//         received_amount: receivedDecimal,
//         taxable_sale: Boolean(taxable_sale),
//         product_purchases: { connect: { purchase_id: purchaseId } },
//         customers: customer_id ? { connect: { customer_id } } : undefined,
//         // company_id: req.user?.company_id
//       };

//       const createdSale = await prisma.product_sales.create({ data: saleData });
//       createdSales.push(createdSale);

//       // Update purchase quantity
//       await prisma.product_purchases.update({
//         where: { purchase_id: purchaseId },
//         data: { purchase_qty: purchase.purchase_qty - Number(sale_qty) }
//       });

//       // Create invoice
//       await prisma.invoice.create({
//         data: {
//           invoice_number: `INV-${createdSale.sale_id}`,
//           issue_date: new Date(),
//           due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//           status,
//           total_amount: totalAmount,
//           tax_amount: taxAmount,
//           company_id: req.user!.company_id,
//           customer_id: customer_id || null,
//           sale_id: createdSale.sale_id,
//           items: {
//             create: [{
//               quantity: Number(sale_qty),
//               unit_price: new Prisma.Decimal(originalItemPrice),
//               discount: new Prisma.Decimal(sale_discount),
//               product_id: purchase.product_id!,
//             }]
//           }
//         }
//       });
//     }
  
//     res.status(201).json(createdSales);
//   } catch (error) {
//     console.error(`Error creating sales: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



// export const createSales = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     if (!req.user!.roles?.includes('admin') && !req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
//       res.status(403).json({ message: "Forbidden! You don't have permission" });
//       return;
//     }

   
//     let totalSaleQty = 0;
    
//     const salesData = Array.isArray(req.body) ? req.body : [req.body];

//     // 1. Group sales by purchase_id and validate stock for each purchase
//     const purchaseGroups = salesData.reduce((acc, sale) => {
//       const key = sale.purchase_id;
//       if (!acc[key]) {
//         acc[key] = {
//           totalQty: 0,
//           items: []
//         };
//       }
//       acc[key].totalQty += Number(sale.sale_qty);
//       acc[key].items.push(sale);
//       return acc;
//     }, {});



    

//     // Initial validations
//     for (const sale of salesData) {
//       const { purchase_id, sale_qty, item_price, sale_discount, received_amount } = sale;
      
//       if (!purchase_id || sale_qty == null || item_price == null || sale_discount == null || received_amount == null||!received_amount||!sale_qty) {
//         res.status(400).json({ message: 'Missing required fields' });
//         return;
//       }

//       const stringFields = [
//         sale_qty.toString(),
//         item_price.toString(),
//         sale_discount.toString(),
//         received_amount.toString()
//       ];
//       if (stringFields.some(field => field.length > 255)) {
//         res.status(400).json({ message: 'Field exceeds 255 character limit' });
//         return;
//       }

//       if (Number(sale_qty) <= 0 || Number(item_price) < 0 || Number(sale_discount) < 0 || Number(received_amount) < 0) {
//         res.status(400).json({ message: 'Invalid values - check for negative numbers or zero quantity' });
//         return;
//       }

//       totalSaleQty += Number(sale_qty);
//     }

//       // Validate seller exists and belongs to the company
//       const seller = await prisma.company_users.findUnique({
//         where: { user_id: req.user!.user_id },
//       });
//       if (!seller || seller.company_id !== req.user!.company_id) {
//         res.status(403).json({ message: "Invalid seller credentials" });
//         return;
//       }

//     const purchaseId = salesData[0].purchase_id;
//     const purchase = await prisma.product_purchases.findUnique({
//       where: { purchase_id: purchaseId },
//       include: { products: { include: { companies: true } } }
//     });

//     if (!purchase || purchase.purchase_qty < totalSaleQty) {
//       const available = purchase?.purchase_qty ?? 0;
//       res.status(400).json({ message: `Unavailable quantity. ${available} remaining` });
//       return;
//     }

//     const taxPercentage = purchase.products!.companies!.tax_percentage || 0;

//     // Validate amounts with tax calculations
//     for (const sale of salesData) {
//       const { sale_qty, item_price, received_amount, taxable_sale, sale_discount } = sale;
      
//       const unitPrice = Number(item_price);
//       const qty = Number(sale_qty);
//       const received = Number(received_amount);

//       // Calculate maximum allowed received amount
//       let maxAllowed = unitPrice * qty;
//       if (taxable_sale) {
//         maxAllowed = (unitPrice + (unitPrice * taxPercentage / 100)) * qty;
//       }

//       if (received > maxAllowed) {
//         res.status(400).json({ message: `Received amount exceeds maximum allowed: ${maxAllowed}` });
//         return;
//       }

//       // Validate discount against remaining amount
//       const baseAmount = taxable_sale 
//         ? (unitPrice * (1 + taxPercentage / 100)) * qty
//         : unitPrice * qty;

//       if (Number(sale_discount) > (baseAmount - received)) {
//         res.status(400).json({ message: `Discount cannot exceed ${baseAmount - received}` });
//         return;
//       }
//     }

//     // Process sales
//     const createdSales = [];
//     for (const sale of salesData) {
//       const { sale_qty, item_price: originalItemPrice, sale_discount, received_amount, customer_id, taxable_sale } = sale;
      
//       // Calculate price with tax if applicable
//       let itemPrice = new Prisma.Decimal(originalItemPrice);
//       if (taxable_sale) {
//         const taxAmount = itemPrice.mul(taxPercentage).div(100);
//         itemPrice = itemPrice.plus(taxAmount);
//       }

//       // Calculate financial values
//       const subtotal = new Prisma.Decimal(sale_qty).mul(itemPrice);
//       const totalAfterDiscount = subtotal.minus(new Prisma.Decimal(sale_discount));
//       const receivedDecimal = new Prisma.Decimal(received_amount);
//       const remainingAmount = totalAfterDiscount.minus(receivedDecimal);

//       // Customer validation for credit sales
//       if (remainingAmount.gt(0) && !customer_id) {
//         res.status(400).json({ message: 'Customer required for credit sales' });
//         return;
//       }

//       // Determine invoice status
//       let status: 'PAID' | 'ISSUED' | 'PARTIAL';
//       if (receivedDecimal.gte(totalAfterDiscount)) {
//         status = 'PAID';
//       } else if (receivedDecimal.equals(0)) {
//         status = 'ISSUED';
//       } else {
//         status = 'PARTIAL';
//       }

//       // Create sale record
//       const saleData = {
//         sale_qty: Number(sale_qty),
//         item_price: itemPrice,
//         sale_discount: new Prisma.Decimal(sale_discount),
//         received_amount: receivedDecimal,
//         taxable_sale,
//         product_purchases: { connect: { purchase_id: purchaseId } },
//         customers: customer_id ? { connect: { customer_id } } : undefined,
//         company_users: {  // Changed from sold_by
//           connect: {
//             user_id: req.user!.user_id
//           }
//         }
//       };

//       const createdSale = await prisma.product_sales.create({ data: saleData });
//       createdSales.push(createdSale);

//       // Update purchase quantity
//       await prisma.product_purchases.update({
//         where: { purchase_id: purchaseId },
//         data: { purchase_qty: purchase.purchase_qty - sale_qty }
//       });

//       // Create invoice with tax amount calculation
//       const taxAmount = taxable_sale
//         ? new Prisma.Decimal(originalItemPrice)
//             .mul(sale_qty)
//             .mul(taxPercentage)
//             .div(100)
//         : new Prisma.Decimal(0);

//       await prisma.invoice.create({
//         data: {
//           invoice_number: `INV-${createdSale.sale_id}`,
//           issue_date: new Date(),
//           due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//           status,
//           total_amount: totalAfterDiscount,
//           tax_amount: taxAmount,
//           company_id: req.user!.company_id,
//           customer_id: customer_id || null,
//           sale_id: createdSale.sale_id,
//           items: {
//             create: [{
//               quantity: Number(sale_qty),
//               unit_price: new Prisma.Decimal(originalItemPrice),
//               discount: new Prisma.Decimal(sale_discount),
//               product_id: purchase.product_id!,
//             }]
//           }
//         }
//       });
//     }

//     res.status(201).json(createdSales);
//   } catch (error) {
//     console.error(`Error creating sales: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


//2025/5
export const createSales = async (req: CustomUserRequest, res: Response) => {
  try {
    // Authorization check
    // if (req.user!.role !== 'admin' && req.user!.role !== 'superAdmin') {
    //   return res.status(403).json({ message: "Forbidden! You don't have permission" });
    // }

    // Normalize input to array
    const salesData = Array.isArray(req.body) ? req.body : [req.body];

    const userRoles = (req.user as any)?.roles || [];
    const isAdminUser = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');

    // Validate seller exists and belongs to the company (skip for admin/superAdmin who may not have company_users)
    if (!isAdminUser) {
      const seller = await prisma.company_users.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!seller || (seller.company_id ?? '') !== (req.user!.company_id ?? '')) {
        return res.status(403).json({ message: "Invalid seller credentials" });
      }
    }

    // Process in transaction (tx = transaction client so treasury + sales commit together)
    const result = await prisma.$transaction(async (tx) => {
      const createdSales: any[] = [];
      const purchaseQuantities: Record<string, number> = {};
      const stockQuantities: Record<string, number> = {};
      const invoiceItems: Array<{
        quantity: number;
        unit_price: Prisma.Decimal;
        discount: Prisma.Decimal;
        product_id: number;
      }> = [];
      let totalInvoiceAmount = new Prisma.Decimal(0);
      let totalTaxAmount = new Prisma.Decimal(0);
      let totalReceivedAmount = new Prisma.Decimal(0);
      let invoiceCustomerId: number | null = null;
      let firstSaleId: number | null = null;
      const toNum = (v: unknown): number => {
        if (v == null) return 0;
        if (typeof v === 'number') return v;
        if (typeof v === 'object') {
          if (typeof (v as any).toNumber === 'function') return (v as any).toNumber();
          if ('$numberDecimal' in (v as any)) return parseFloat((v as any).$numberDecimal) || 0;
        }
        const cleaned = String(v).replace(/[^0-9.\-]/g, '');
        return parseFloat(cleaned) || 0;
      };

      // ---------- First pass: validate inputs (allow fractional qty e.g. 0.5) ----------
      for (const sale of salesData) {
        const { purchase_id, stock_id, item_price, sale_discount, received_amount, customer_id } = sale;
        const sale_qty = sale.sale_qty != null ? parseFloat(String(sale.sale_qty).replace(',', '.')) : null;

        const hasPurchase = purchase_id != null && purchase_id !== '' && purchase_id !== 0;
        const hasStock = stock_id != null && stock_id !== '' && stock_id !== 0;

        if (!hasPurchase && !hasStock) {
          throw { status: 400, message: 'Missing required fields: provide purchase_id or stock_id' };
        }
        if (sale_qty == null || item_price == null || sale_discount == null || received_amount == null ||
            Number.isNaN(sale_qty) || item_price === '' || received_amount === '') {
          throw { status: 400, message: 'Missing required fields (sale_qty, item_price, sale_discount, received_amount)' };
        }

        const stringFields = [String(sale_qty), String(item_price), String(sale_discount), String(received_amount)];
        if (stringFields.some((f: string) => f.length > 255)) {
          throw { status: 400, message: 'Field exceeds 255 character limit' };
        }
        if (sale_qty <= 0 || Number(item_price) < 0 || Number(sale_discount) < 0 || Number(received_amount) < 0) {
          throw { status: 400, message: 'Invalid values - check for negative numbers or zero quantity (fractions like 0.5 are allowed)' };
        }

        if (hasPurchase) {
          purchaseQuantities[purchase_id] = (purchaseQuantities[purchase_id] || 0) + sale_qty;
        }
        if (hasStock) {
          const sid = String(stock_id);
          stockQuantities[sid] = (stockQuantities[sid] || 0) + sale_qty;
        }

        if (invoiceCustomerId === null && customer_id) {
          invoiceCustomerId = customer_id;
        } else if (invoiceCustomerId !== null && customer_id != null && invoiceCustomerId !== customer_id) {
          throw { status: 400, message: 'All items in a sale must belong to the same customer' };
        }
      }

      // ---------- Second pass: validate purchase stock ----------
      if (Object.keys(purchaseQuantities).length > 0) {
        for (const purchaseId of Object.keys(purchaseQuantities)) {
          const purchase = await tx.product_purchases.findUnique({
            where: { purchase_id: +purchaseId },
            include: { products: true, vendors: { include: { companies: true } } },
          });
          if (!purchase) throw { status: 404, message: `Purchase ${purchaseId} not found` };
          if (Number(purchase.purchase_qty) < purchaseQuantities[purchaseId]) {
            throw { status: 400, message: `Unavailable qty for purchase ${purchaseId}. ${purchase.purchase_qty} remaining` };
          }
        }
      }

      // ---------- Second pass: validate warehouse stock ----------
      const stockRecords: Record<string, any> = {};
      if (Object.keys(stockQuantities).length > 0) {
        for (const sid of Object.keys(stockQuantities)) {
          const stock = await tx.warehouse_stock.findUnique({
            where: { stock_id: +sid },
            include: { warehouse: true, product: true },
          });
          if (!stock) throw { status: 404, message: `Stock ${sid} not found` };
          if (stock.warehouse.company_id !== req.user!.company_id) {
            throw { status: 403, message: `Stock ${sid} does not belong to your company` };
          }
          if (Number(stock.quantity) < stockQuantities[sid]) {
            throw { status: 400, message: `Unavailable qty for stock ${sid}. ${stock.quantity} remaining` };
          }
          stockRecords[sid] = stock;
        }
      }

      // Company tax percentage (for stock_id sales)
      const company = await tx.companies.findUnique({ where: { company_id: req.user!.company_id } });
      const companyTaxPct = company?.tax_percentage ?? 0;

      // Preload latest purchase cost per product (cost from purchase, not product — market is changeable)
      const stockProductIds = Array.from(new Set(Object.values(stockRecords).map((s: any) => s?.product_id).filter(Boolean))) as number[];
      const latestPurchaseCostByProduct: Record<number, number> = {};
      if (stockProductIds.length > 0) {
        const purchases = await tx.product_purchases.findMany({
          where: {
            product_id: { in: stockProductIds },
            vendors: { company_id: req.user!.company_id },
          },
          select: { product_id: true, item_cost: true },
          orderBy: { created_at: 'desc' },
        });
        for (const p of purchases) {
          if (p.product_id != null && latestPurchaseCostByProduct[p.product_id] === undefined) {
            const n = toNum(p.item_cost);
            if (n > 0) latestPurchaseCostByProduct[p.product_id] = n;
          }
        }
      }

      // ---------- Third pass: create sales ----------
      for (const sale of salesData) {
        const { purchase_id, stock_id, item_price: originalItemPrice, sale_discount, received_amount, customer_id, taxable_sale } = sale;
        const sale_qty = sale.sale_qty != null ? parseFloat(String(sale.sale_qty).replace(',', '.')) : 0;
        const hasStock = stock_id != null && stock_id !== '' && stock_id !== 0;

        // ===== STOCK PATH (company store) =====
        if (hasStock) {
          const sid = String(stock_id);
          const stock = stockRecords[sid];
          const taxPercentage = companyTaxPct;
          const unitPrice = Number(originalItemPrice);
          const qty = sale_qty;
          const received = Number(received_amount);

          // No cap on received — market sellers may accept more than item price

          const baseAmount = taxable_sale ? (unitPrice * (1 + taxPercentage / 100)) * qty : unitPrice * qty;
          if (Number(sale_discount) > baseAmount) throw { status: 400, message: `Discount cannot exceed item total: ${baseAmount}` };

          let itemPrice = new Prisma.Decimal(originalItemPrice);
          if (taxable_sale) itemPrice = itemPrice.plus(itemPrice.mul(taxPercentage).div(100));

          const subtotal = new Prisma.Decimal(sale_qty).mul(itemPrice);
          const totalAfterDiscount = subtotal.minus(new Prisma.Decimal(sale_discount));
          const receivedDecimal = new Prisma.Decimal(received_amount);
          if (totalAfterDiscount.gt(receivedDecimal) && !customer_id) {
            throw { status: 400, message: 'Customer required for credit sales' };
          }

          const createdSale = await tx.product_sales.create({
            data: {
              sale_qty: qty,
              item_price: itemPrice,
              sale_discount: new Prisma.Decimal(sale_discount),
              received_amount: receivedDecimal,
              unit_cost:
                stock?.unit_cost != null
                  ? new Prisma.Decimal(String(toNum(stock.unit_cost)))
                  : (latestPurchaseCostByProduct[stock.product_id] != null ? new Prisma.Decimal(String(latestPurchaseCostByProduct[stock.product_id])) : null),
              cost_source:
                stock?.unit_cost != null
                  ? 'STOCK'
                  : (latestPurchaseCostByProduct[stock.product_id] != null ? 'LATEST_PURCHASE' : null),
              taxable_sale: taxable_sale || false,
              warehouse_stock: { connect: { stock_id: +stock_id } },
              customers: customer_id ? { connect: { customer_id } } : undefined,
              company_users: { connect: { user_id: req.user!.user_id } },
            },
          });
          createdSales.push(createdSale);
          if (!firstSaleId) firstSaleId = createdSale.sale_id;

          if (receivedDecimal.gt(0)) {
            await TreasuryService.recordMovement(req.user!.company_id, receivedDecimal, TransactionAuditType.DEBIT, TransactionCategory.SALE, req.user!.user_id, `SALE-${createdSale.sale_id}`, `Sale #${createdSale.sale_id}`, tx);
          }

          // Deduct from warehouse_stock; remove from store (delete row) if quantity becomes 0
          const newQty = stock.quantity - qty;
          if (newQty <= 0) {
            // Null stock_id on all product_sales that reference this stock so we can delete the stock row
            await tx.product_sales.updateMany({
              where: { stock_id: +stock_id },
              data: { stock_id: null },
            });
            await tx.warehouse_stock.delete({
              where: { stock_id: +stock_id },
            });
          } else {
            await tx.warehouse_stock.update({
              where: { stock_id: +stock_id },
              data: { quantity: newQty },
            });
          }
          // Keep in-memory quantity in sync so multiple lines with same stock_id deduct correctly
          stock.quantity = newQty <= 0 ? 0 : newQty;

          // Also deduct mirrored store_stock ("Already in store") so inventory sync won't re-add sold qty
          const linkedStoreIds = (
            await tx.store_companies.findMany({
              where: { company_id: req.user!.company_id },
              select: { store_id: true },
            })
          ).map((r) => r.store_id);
          if (linkedStoreIds.length > 0) {
            let remainingToDeduct = qty;
            const storeRows = await tx.store_stock.findMany({
              where: {
                store_id: { in: linkedStoreIds },
                product_id: stock.product_id,
                quantity: { gt: 0 },
              },
              orderBy: { stock_id: 'asc' },
            });
            for (const srow of storeRows) {
              if (remainingToDeduct <= 0) break;
              const sQty = Number(srow.quantity);
              const take = Math.min(sQty, remainingToDeduct);
              const left = sQty - take;
              if (left <= 0) {
                await tx.store_stock.delete({ where: { stock_id: srow.stock_id } });
              } else {
                await tx.store_stock.update({
                  where: { stock_id: srow.stock_id },
                  data: { quantity: left },
                });
              }
              remainingToDeduct -= take;
            }
          }

          const taxAmount = taxable_sale ? new Prisma.Decimal(originalItemPrice).mul(qty).mul(taxPercentage).div(100) : new Prisma.Decimal(0);
          totalInvoiceAmount = totalInvoiceAmount.plus(totalAfterDiscount);
          totalTaxAmount = totalTaxAmount.plus(taxAmount);
          totalReceivedAmount = totalReceivedAmount.plus(receivedDecimal);
          invoiceItems.push({ quantity: qty, unit_price: itemPrice, discount: new Prisma.Decimal(sale_discount), product_id: stock.product_id });
          continue;
        }

        // ===== PURCHASE PATH (existing flow) =====
        const purchase = await tx.product_purchases.findUnique({
          where: { purchase_id },
          include: { products: true, vendors: { include: { companies: true } } },
        });
        if (!purchase) throw { status: 404, message: `Purchase ${purchase_id} not found` };
        if (Number(purchase.purchase_qty) < sale_qty) {
          throw { status: 400, message: `Unavailable qty for purchase ${purchase_id}. ${purchase.purchase_qty} remaining` };
        }

        const taxPercentage = purchase.vendors?.companies?.tax_percentage ?? 0;
        const unitPrice = Number(originalItemPrice);
        const qty = sale_qty;
        const received = Number(received_amount);

        const lineSubtotal = unitPrice * qty;
        // No cap on received — market sellers may accept more than item price

        const baseAmount = taxable_sale ? (unitPrice * (1 + taxPercentage / 100)) * qty : unitPrice * qty;
        if (Number(sale_discount) > baseAmount) throw { status: 400, message: `Discount cannot exceed item total: ${baseAmount}` };

        let itemPrice = new Prisma.Decimal(originalItemPrice);
        if (taxable_sale) itemPrice = itemPrice.plus(itemPrice.mul(taxPercentage).div(100));

        const subtotal = new Prisma.Decimal(sale_qty).mul(itemPrice);
        const totalAfterDiscount = subtotal.minus(new Prisma.Decimal(sale_discount));
        const receivedDecimal = new Prisma.Decimal(received_amount);
        if (totalAfterDiscount.gt(receivedDecimal) && !customer_id) {
          throw { status: 400, message: 'Customer required for credit sales' };
        }

        const createdSale = await tx.product_sales.create({
          data: {
            sale_qty: qty,
            item_price: itemPrice,
            sale_discount: new Prisma.Decimal(sale_discount),
            received_amount: receivedDecimal,
            unit_cost: purchase.item_cost as any,
            cost_source: 'PURCHASE',
            taxable_sale: taxable_sale || false,
            product_purchases: { connect: { purchase_id } },
            customers: customer_id ? { connect: { customer_id } } : undefined,
            company_users: { connect: { user_id: req.user!.user_id } },
          },
        });
        createdSales.push(createdSale);
        if (!firstSaleId) firstSaleId = createdSale.sale_id;

        if (receivedDecimal.gt(0)) {
          await TreasuryService.recordMovement(req.user!.company_id, receivedDecimal, TransactionAuditType.DEBIT, TransactionCategory.SALE, req.user!.user_id, `SALE-${createdSale.sale_id}`, `Sale #${createdSale.sale_id}`, tx);
        }

        await tx.product_purchases.update({ where: { purchase_id }, data: { purchase_qty: Number(purchase.purchase_qty) - sale_qty } });

        const taxAmount = taxable_sale ? new Prisma.Decimal(originalItemPrice).mul(sale_qty).mul(taxPercentage).div(100) : new Prisma.Decimal(0);
        if (!purchase.product_id) throw { status: 400, message: `Missing product ID for purchase ${purchase_id}` };

        totalInvoiceAmount = totalInvoiceAmount.plus(totalAfterDiscount);
        totalTaxAmount = totalTaxAmount.plus(taxAmount);
        totalReceivedAmount = totalReceivedAmount.plus(receivedDecimal);
        invoiceItems.push({ quantity: qty, unit_price: itemPrice, discount: new Prisma.Decimal(sale_discount), product_id: purchase.product_id! });
      }

      // Create single invoice with all items after all sales are created
      if (createdSales.length > 0 && invoiceItems.length > 0) {
        const isFullyPaid = totalReceivedAmount.gte(totalInvoiceAmount) ||
          totalReceivedAmount.gte(totalInvoiceAmount.minus(0.005));
        const effectivePaidAmount = totalReceivedAmount;

        let invoiceStatus: 'PAID' | 'ISSUED' | 'PARTIAL';
        if (isFullyPaid) {
          invoiceStatus = 'PAID';
        } else if (totalReceivedAmount.equals(0)) {
          invoiceStatus = 'ISSUED';
        } else {
          invoiceStatus = 'PARTIAL';
        }

        const totalDiscountAmount = invoiceItems.reduce(
          (sum, it) => sum.plus(it.discount),
          new Prisma.Decimal(0)
        );

        await tx.invoice.create({
          data: {
            invoice_number: `INV-${firstSaleId}`,
            issue_date: new Date(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: invoiceStatus,
            total_amount: totalInvoiceAmount,
            tax_amount: totalTaxAmount,
            total_paid_amount: effectivePaidAmount,
            total_discount_amount: totalDiscountAmount,
            company_id: req.user!.company_id,
            customer_id: invoiceCustomerId,
            sale_id: firstSaleId, // Link to first sale (schema constraint: sale_id is unique)
            items: {
              create: invoiceItems
            }
          }
        });
      }

      return createdSales;
    });

    return res.status(201).json(result);
  } catch (error:any) {
    console.error(`Error creating sales: ${error}`);
    if (error.status && error.message) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.user!.roles?.includes('admin') && !req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    // Destructure input including customer_id
    const { sale_qty, item_price: originalItemPrice, sale_discount, received_amount, taxable_sale, customer_id } = req.body;
    const saleId = parseInt(req.params.id);

    // Validate required fields (customer_id is not required when sale is fully paid)
    if (!sale_qty || !originalItemPrice || !sale_discount || !received_amount) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Get existing sale with related data
    const userCompanyId = (req.user as any)?.company_id;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    const where: any = { sale_id: saleId };
    if (userCompanyId && !isMainAdmin) {
      where.OR = [
        { product_purchases: { vendors: { company_id: userCompanyId } } },
        { company_users: { company_id: userCompanyId } },
      ];
    }
    const existingSale = await prisma.product_sales.findFirst({
      where,
      include: {
        product_purchases: {
          include: {
            products: true,
            vendors: { include: { companies: true } }
          }
        },
        Invoice: true
      }
    });

    if (!existingSale) {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }

    // Update is only supported for purchase-based sales (not warehouse/stock sales)
    if (!existingSale.product_purchases) {
      res.status(400).json({ message: 'Update not supported for warehouse/stock-based sales' });
      return;
    }

    // Convert values to numbers
    const numSaleQty = Number(sale_qty);
    const numItemPrice = Number(originalItemPrice);
    const numReceived = Number(received_amount);
    const numDiscount = Number(sale_discount);

    // Validate received amount and discount (basic non-taxable validations)
    if (numReceived > numItemPrice * numSaleQty) {
      res.status(400).json({ message: `Received Amount cannot exceed ${numItemPrice * numSaleQty}` });
      return;
    }
    if (numDiscount > (numItemPrice * numSaleQty - numReceived)) {
      res.status(400).json({ 
        message: `Sale discount cannot exceed ${numItemPrice * numSaleQty - numReceived}` 
      });
      return;
    }

    // Calculate quantity difference and update purchase quantity accordingly
    const quantityDifference = Number(existingSale.sale_qty) - numSaleQty;
    const newPurchaseQty = Number(existingSale.product_purchases!.purchase_qty) + quantityDifference;
    if (newPurchaseQty < 0) {
      res.status(400).json({ 
        message: `Unavailable quantity. ${Number(existingSale.product_purchases!.purchase_qty) + Number(existingSale.sale_qty)} available.`
      });
      return;
    }

    const taxPercentage = existingSale.product_purchases!.vendors?.companies?.tax_percentage ?? 5;

    // Calculate full sale amount including tax if taxable_sale is true
    const saleAmount = numSaleQty * numItemPrice + (
      taxable_sale ? numSaleQty * numItemPrice * (taxPercentage / 100) : 0
    );
    // Compute remaining balance after discount and received amount (i.e. credit)
    const saleHasCredit = (saleAmount - numDiscount - numReceived) > 0;
    // When there is credit and the sale is not fully paid, a customer must be provided
    if (saleHasCredit && (customer_id === undefined || customer_id === null)) {
      res.status(400).json({ message: 'Customer needed when sale is not 100% cash' });
      return;
    }

    // Calculate financial values for the invoice:
    let adjustedItemPrice = new Prisma.Decimal(originalItemPrice);
    if (taxable_sale) {
      const taxToAdd = adjustedItemPrice.mul(new Prisma.Decimal(taxPercentage)).div(100);
      adjustedItemPrice = adjustedItemPrice.plus(taxToAdd);
    }
    const subtotal = new Prisma.Decimal(numSaleQty).times(adjustedItemPrice);
    const taxAmount = taxable_sale 
      ? new Prisma.Decimal(originalItemPrice).mul(numSaleQty).mul(taxPercentage).div(100)
      : new Prisma.Decimal(0);
    const totalAfterDiscount = subtotal.plus(taxAmount).minus(new Prisma.Decimal(numDiscount));
    const receivedDecimal = new Prisma.Decimal(numReceived);

    // Determine invoice status
    let status: 'PAID' | 'ISSUED' | 'PARTIAL';
    if (receivedDecimal.gte(totalAfterDiscount)) {
      status = 'PAID';
    } else if (receivedDecimal.equals(0)) {
      status = 'ISSUED';
    } else {
      status = 'PARTIAL';
    }

    // Perform updates in a transaction
    const [updatedSale, updatedPurchase, updatedInvoice] = await prisma.$transaction([
      prisma.product_sales.update({
        where: { sale_id: saleId },
        data: {
          sale_qty: numSaleQty,
          item_price: adjustedItemPrice,
          sale_discount: new Prisma.Decimal(numDiscount),
          received_amount: receivedDecimal,
          taxable_sale: Boolean(taxable_sale),
          // Optionally update customer if provided
          ...(customer_id ? { customers: { connect: { customer_id } } } : {}),
          updated_at: new Date()
        }
      }),
      prisma.product_purchases.update({
        where: { purchase_id: existingSale.purchase_id! },
        data: { purchase_qty: newPurchaseQty }
      }),
      prisma.invoice.update({
        where: { sale_id: saleId },
        data: {
          status: status,
          total_amount: totalAfterDiscount,
          tax_amount: taxAmount,
          items: {
            updateMany: {
              where: { invoice_id: existingSale.Invoice[0].id },
              data: {
                quantity: numSaleQty,
                unit_price: new Prisma.Decimal(numItemPrice),
                discount: new Prisma.Decimal(numDiscount)
              }
            }
          }
        }
      })
    ]);

    res.status(200).json(updatedSale);
  } catch (error) {
    console.error(`Error updating sale: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const deleteSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const saleId = parseInt(req.params.id);
    const userCompanyId = (req.user as any)?.company_id;
    const userRoles = (req.user as any)?.roles || [];
    const isMainAdmin = userRoles.includes('admin') || userRoles.includes('superAdmin') || userRoles.includes('super_admin');
    const where: any = { sale_id: saleId };
    if (userCompanyId && !isMainAdmin) {
      where.OR = [
        { product_purchases: { vendors: { company_id: userCompanyId } } },
        { company_users: { company_id: userCompanyId } },
      ];
    }
    const sale = await prisma.product_sales.findFirst({
      where,
      include: { 
        product_purchases: true,
        warehouse_stock: true,
        Invoice: true
      }
    });

    if (!sale) {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }

    // Resolve owning invoice even if this sale line is not the anchor sale.
    const invoiceStarts = await prisma.invoice.findMany({
      where: {
        sale_id: { not: null, lte: saleId },
        company_id: (req.user as any)?.company_id ?? undefined,
      },
      select: { id: true, sale_id: true, status: true, company_id: true },
      orderBy: { sale_id: 'desc' },
      take: 1,
    });
    const ownerInvoice = invoiceStarts[0] ?? null;
    if (!ownerInvoice || ownerInvoice.sale_id == null) {
      res.status(400).json({ message: 'No owning invoice found for this sale line.' });
      return;
    }
    if (ownerInvoice.status === 'VOID') {
      res.status(200).json({ message: 'Sale already voided.' });
      return;
    }

    // Invoice transaction = [anchor sale_id, next invoice anchor)
    const nextInvoice = await prisma.invoice.findFirst({
      where: {
        sale_id: { gt: ownerInvoice.sale_id },
        company_id: ownerInvoice.company_id,
      },
      select: { sale_id: true },
      orderBy: { sale_id: 'asc' },
    });
    const txSales = await prisma.product_sales.findMany({
      where: {
        sale_id: {
          gte: ownerInvoice.sale_id,
          lt: nextInvoice?.sale_id ?? 999999999,
        },
      },
      include: { product_purchases: true, warehouse_stock: true },
      orderBy: { sale_id: 'asc' },
    });

    await prisma.$transaction(async (tx) => {
      // 1) Mark invoice void (soft-delete semantics, keep history)
      await tx.invoice.update({
        where: { id: ownerInvoice.id },
        data: { status: 'VOID' },
      });

      // 2) Restore quantities for all lines in that invoice transaction (one-time only)
      for (const row of txSales) {
        if (row.purchase_id && row.product_purchases) {
          await tx.product_purchases.update({
            where: { purchase_id: row.purchase_id },
            data: { purchase_qty: Number(row.product_purchases.purchase_qty) + Number(row.sale_qty) },
          });
        } else if (row.stock_id && row.warehouse_stock) {
          await tx.warehouse_stock.update({
            where: { stock_id: row.stock_id },
            data: { quantity: Number(row.warehouse_stock.quantity) + Number(row.sale_qty) },
          });
        }
      }
    });

    res.status(200).json({ message: 'Sale voided successfully (not deleted).' });
  } catch (error) {
    console.error(`Error deleting sale: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};


























































































































































































///kyd 
// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { CustomUserRequest } from "../middlewares";
// import { Prisma } from '@prisma/client';

// // Updated controller
// export const getAllSales = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const pageSize = parseInt(req.query.pageSize as string) || 20;
//     const skip = (page - 1) * pageSize;

//     const [total, sales] = await prisma.$transaction([
//       prisma.product_sales.count({
//         where: {
//           product_purchases: {
//             products: { company_id: req.user!.company_id }
//           }
//         }
//       }),
//       prisma.product_sales.findMany({
//         where: {
//           product_purchases: {
//             products: { company_id: req.user!.company_id }
//           }
//         },
//         include: {
//           product_purchases: {
//             include: { products: true }
//           },
//           customers: true
//         },
//         orderBy: {
//           created_at: 'desc' // Sorting by latest sales first
//         },
//         skip,
//         take: pageSize,
//       })
//     ]);

//     res.status(200).json({
//       data: sales,
//       total,
//       page,
//       pageSize,
//       totalPages: Math.ceil(total / pageSize)
//     });
//   } catch (error) {
//     console.error(`Error fetching sales: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const getSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     const sale = await prisma.product_sales.findFirst({
//       where: { 
//         sale_id: parseInt(req.params.id),
//         product_purchases: {
//           products: { company_id: req.user!.company_id }
//         }
//       },
//       include: {
//         product_purchases: {
//           include:{
//             products:true
//           }
//         },
//         customers: true
//       }
//     });
//     sale ? res.status(200).json(sale) : res.status(404).json({ message: 'Sale not found' });
//   } catch (error) {
//     console.error(`Error fetching sale: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const createSales = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     // Authorization check
//     if (!req.user!.roles?.includes('admin') && !req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
//       res.status(403).json({ message: 'Forbidden! You don\'t have permission' });
//       return;
//     }

//     // Ensure request body is an array
//     const salesData = Array.isArray(req.body) ? req.body : [req.body];
//     let totalSaleQty = 0;

//     // Validate all sales first
//     for (const sale of salesData) {
//       const { purchase_id, sale_qty, item_price, sale_discount, received_amount, customer_id, taxable_sale } = sale;
      
//       // Validate required fields
//       if (!purchase_id || !sale_qty || !item_price || !sale_discount || !received_amount) {
//         res.status(400).json({ message: 'Missing required fields' });
//         return;
//       }

//       // Validate field lengths
//       const stringFields = [
//         sale_qty.toString(),
//         item_price.toString(),
//         sale_discount.toString(),
//         received_amount.toString()
//       ];
//       if (stringFields.some(field => field.length > 255)) {
//         res.status(400).json({ message: 'Field exceeds 255 character limit' });
//         return;
//       }
     

//       if(received_amount > item_price *sale_qty){
//         res.status(400).json({message:`Received Amount cannot exceed Item Price:${item_price}`})
//         return;
//       }

//       if (Number(sale_discount) > Number(item_price) * Number(sale_qty) - Number(received_amount)) {
//         res.status(400).json({ 
//           message: `Sale discount cannot exceed ${item_price * sale_qty - received_amount}` 
//         });
//         return;
//       }
      

//       // Validate non-negative values
//       if (sale_qty < 0 || item_price < 0 || sale_discount < 0 || received_amount < 0) {
//         res.status(400).json({ message: 'Values cannot be negative' });
//         return;
//       }

//       totalSaleQty += Number(sale_qty);
//     }

//     // // Check all sales have same purchase_id
//     // const uniquePurchaseIds = new Set(salesData.map(s => s.purchase_id));
//     // if (uniquePurchaseIds.size > 1) {
//     //   res.status(400).json({ message: 'All sales must have the same purchase_id' });
//     //   return;
//     // }
    

//     const purchaseId = salesData[0].purchase_id;
//     const purchase = await prisma.product_purchases.findUnique({
//       where: { purchase_id: purchaseId },
//       include: {
//         products: {
//           include: { companies: true }
//         }
//       }
//     });

//     if (!purchase || purchase.purchase_qty < totalSaleQty) {
//       const available = purchase?.purchase_qty ?? 0;
//       res.status(400).json({ message: `Unavailable quantity. ${available} quantities remaining.` });
//       return;
//     }

//     // Process sales
//     const createdSales = [];
//     for (const sale of salesData) {
//       const { sale_qty, item_price, sale_discount, received_amount, customer_id, taxable_sale } = sale;
//       const taxPercentage = purchase.products!.companies!.tax_percentage;
//       const saleAmount = new Prisma.Decimal(sale_qty)
//         .times(new Prisma.Decimal(item_price))
//         .plus(
//           taxable_sale 
//             ? new Prisma.Decimal(sale_qty)
//                 .times(new Prisma.Decimal(item_price))
//                 .times(new Prisma.Decimal(taxPercentage!).div(100))
//             : 0
//         );

//       const saleHasCredit = saleAmount
//         .minus(new Prisma.Decimal(received_amount))
//         .minus(new Prisma.Decimal(sale_discount))
//         .gt(0);

//       if (saleHasCredit && !customer_id) {
//         res.status(400).json({ message: 'Customer required for credit sales' });
//         return;
//       }

//       const saleData: any = {
//         sale_qty: Number(sale_qty),
//         item_price: new Prisma.Decimal(item_price),
//         sale_discount: new Prisma.Decimal(sale_discount),
//         received_amount: new Prisma.Decimal(received_amount),
//         taxable_sale: Boolean(taxable_sale),
//         product_purchases: {
//           connect: { purchase_id: purchaseId }
//         }, 
//         customers: customer_id ? {
//           connect: { customer_id: customer_id }
//         } : undefined,
//         // company_id:req.user?.company_id
//       };

//       const createdSale = await prisma.product_sales.create({ data: saleData });
//       createdSales.push(createdSale);

//       // Update purchase quantity
//       await prisma.product_purchases.update({
//         where: { purchase_id: purchaseId },
//         data: { purchase_qty: purchase.purchase_qty - sale_qty }
//       });
//     }

//     res.status(201).json(createdSales);
//   } catch (error) {
//     console.error(`Error creating sales: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const updateSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     if (!req.user!.roles?.includes('admin') && !req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
//       res.status(403).json({ message: 'Forbidden' });
//       return;
//     }

//     const { sale_qty, item_price, sale_discount, received_amount, taxable_sale } = req.body;
//     const saleId = parseInt(req.params.id);

//     // Validate required fields
//     if (!sale_qty || !item_price || !sale_discount || !received_amount) {
//       res.status(400).json({ message: 'Missing required fields' });
//       return;
//     }

//     // Get existing sale with purchase and company info
//     const existingSale = await prisma.product_sales.findFirst({
//       where: {
//         sale_id: saleId,
//         product_purchases: {
//           products: { company_id: req.user!.company_id }
//         }
//       },
//       include: {
//         product_purchases: true
//       }
//     });

//     if (!existingSale) {
//       res.status(404).json({ message: 'Sale not found' });
//       return;
//     }



//     if(received_amount > item_price *sale_qty){
//       res.status(400).json({message:`Received Amount cannot exceed Item Price:${item_price}`})
//       return;
//     }

    
//      // Prevent discount from exceeding (item_price * sale_qty) - received_amount
//      const totalPrice = Number(item_price) * Number(sale_qty);
//      if (Number(sale_discount) > totalPrice - Number(received_amount)) {
//        res.status(400).json({ 
//          message: `Sale discounts cannot exceed ${(item_price * sale_qty) - received_amount}`
//        });
//        return;
//      }

     
//     // Calculate quantity difference
//     const quantityDifference = existingSale.sale_qty - Number(sale_qty);
//     const newPurchaseQty = existingSale.product_purchases!.purchase_qty + quantityDifference;

//     if (newPurchaseQty < 0) {
//       res.status(400).json({ 
//         message: `Unavailable quantity. ${existingSale.product_purchases!.purchase_qty + existingSale.sale_qty} available.`
//       });
//       return;
//     }

//     // Update sale and purchase
//     const [updatedSale] = await prisma.$transaction([
//       prisma.product_sales.update({
//         where: { sale_id: saleId },
//         data: {
//           sale_qty: Number(sale_qty),
//           item_price: new Prisma.Decimal(item_price),
//           sale_discount: new Prisma.Decimal(sale_discount),
//           received_amount: new Prisma.Decimal(received_amount),
//           taxable_sale: Boolean(taxable_sale),
//           updated_at: new Date()
//         }
//       }),
//       prisma.product_purchases.update({
//         where: { purchase_id: existingSale.purchase_id! },
//         data: { purchase_qty: newPurchaseQty }
//       })
//     ]);

//     res.status(200).json(updatedSale);
//   } catch (error) {
//     console.error(`Error updating sale: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const deleteSale = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     if (!req.user!.roles?.includes('admin') && !req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
//       res.status(403).json({ message: 'Forbidden' });
//       return;
//     }
//     console.log(req.params.id)
//     const saleId = parseInt(req.params.id);
//     const sale = await prisma.product_sales.findFirst({
//       where: {
//         sale_id: saleId,
//         product_purchases: {
//           products: { company_id: req.user!.company_id }
//         }
//       },
//       include: { product_purchases: true }
//     });

//     if (!sale) {
//       res.status(404).json({ message: 'Sale not found' });
//       return;
//     }

//     await prisma.$transaction([
//       prisma.product_sales.delete({ where: { sale_id: saleId } }),
//       prisma.product_purchases.update({
//         where: { purchase_id: sale.purchase_id! },
//         data: { purchase_qty: sale.product_purchases!.purchase_qty + sale.sale_qty }
//       })
//     ]);

//     res.status(200).json({ message: 'Sale deleted successfully' });
//   } catch (error) {
//     console.error(`Error deleting sale: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
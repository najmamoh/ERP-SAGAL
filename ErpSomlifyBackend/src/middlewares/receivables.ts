import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";

interface SaleWithCompany {
  company_id: string | null;
}

export const checkCompanyHasThisSale = async (req: Request, res: Response, next: NextFunction) => {
  const productSale: SaleWithCompany[] = await prisma.$queryRaw`
  SELECT vendors.company_id
  FROM product_sales
  JOIN product_purchases ON product_sales.purchase_id = product_purchases.purchase_id
  LEFT JOIN vendors ON product_purchases.vendor_id = vendors.vendor_id
  WHERE sale_id = ${req.body.sale_id}`;

  if (productSale[0]) {
    const saleCompanyId = productSale[0].company_id ?? '';
    if (req.query.company_id && saleCompanyId !== req.query.company_id) {
      return res.status(401).send({ message: 'This company does not have this purchase.' });
    }
  } else {
    return res.status(404).send({ message: 'Not found that product.' });
  }

  next();
};



// import { Request, Response, NextFunction } from 'express';
// import { prisma } from '../prisma';
// import { CustomUserRequest } from './authJwtMiddleware';


// export const checkCompanyHasThisSale = async (
//   req: CustomUserRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const sale = await prisma.product_sales.findUnique({
//       where: { sale_id: req.body.sale_id },
//       include: {
//         product_purchases: {
//           include: { products: true }
//         }
//       }
//     });

//     if (!sale) {
//       return res.status(404).json({ message: 'Sale not found' });
//     }

//     if (sale.product_purchases!.products!.company_id !== req.user!.company_id) {
//       return res.status(403).json({ message: 'Unauthorized access to this sale' });
//     }

//     next();
//   } catch (error) {
//     console.error(`Middleware error: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";

interface PurchaseWithCompany {
  company_id: string | null;
}

export const checkCompanyHasThisPurchase = async (req: Request, res: Response, next: NextFunction) => {
  const productPurchase: PurchaseWithCompany[] = await prisma.$queryRaw`
  SELECT vendors.company_id
  FROM product_purchases
  LEFT JOIN vendors ON product_purchases.vendor_id = vendors.vendor_id
  WHERE purchase_id = ${req.body.purchase_id}`;

  if (productPurchase[0]) {
    const purchaseCompanyId = productPurchase[0].company_id ?? '';
    if (req.query.company_id && purchaseCompanyId !== req.query.company_id) {
      return res.status(401).send({ message: 'This company does not have this purchase.' });
    }
  } else {
    return res.status(404).send({ message: 'Not found that product.' });
  }

  next();
};
import { Response, NextFunction } from 'express';

export const checkSalesHasSamePurchaseId = (req: any, res: Response, next: NextFunction) => {
  const purchase_id = req.body[0].purchase_id;
  let totalSaleQty = 0;
  for (const sale of req.body) {
    if (sale.purchase_id !== purchase_id) {
      return res.status(400).send({ message: 'Sales must have a same purchase id.' })
    }
    // add current sale qty to totalSaleQty
    totalSaleQty += sale.sale_qty;
  }
  req.totalSaleQty = totalSaleQty
  next();
}
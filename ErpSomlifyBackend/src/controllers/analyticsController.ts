import { Request, Response } from "express";
import { prisma } from "../prisma";
import { controller, get, queryValidator } from "../decorators";

@controller('/api/analytics')
class Anlytics {
  @get('/products-sales')
  @queryValidator('company_id', 'start_date', 'end_date')
  async productSales (req: Request, res: Response) {
    let start_date = new Date();
    let end_date = new Date();
    if (typeof req.query.start_date === 'string' && typeof req.query.end_date === 'string') {
       start_date = new Date(req.query.start_date);
       end_date = new Date(req.query.end_date);
    }

    if (Number.isNaN(start_date.getFullYear()) || Number.isNaN(end_date.getFullYear())) {
      res.status(400).send({ message: 'start_date or end_date are incrorrect!' })
    }

    const result = await prisma.$queryRaw`SELECT product_name, SUM(
      CASE 
        WHEN product_sales.created_at BETWEEN ${start_date} AND ${end_date}
        THEN sale_qty * item_price
        ELSE '0'
      END  
      )
      FROM products
      LEFT JOIN product_purchases ON product_purchases.product_id  = products.product_id
      LEFT JOIN product_sales ON product_sales.purchase_id = product_purchases.purchase_id
      WHERE company_id = ${req.query.company_id}
      GROUP BY product_name`;
      res.status(200).send(result);
  }
  @get('/sales-per-year')
  @queryValidator('company_id', 'year')
  async salesPerYear (req: Request, res: Response) {
    // create start_date and end_date based on year
    const start_date = new Date('Jan 1 2024')
    const end_date = new Date('Dec 31 2024');
    start_date.setFullYear(Number(req.query.year));
    end_date.setFullYear(Number(req.query.year))
    // fetching the database
    const result: [ { month: Date, sum: string }] = await prisma.$queryRaw`SELECT DATE_TRUNC('month', product_sales.created_at) AS month, SUM(sale_qty * item_price)
    FROM product_sales
    JOIN product_purchases ON product_sales.purchase_id = product_purchases.purchase_id
    JOIN products ON product_purchases.product_id = products.product_id
    WHERE company_id = ${req.query.company_id} AND product_sales.created_at BETWEEN ${start_date} AND ${end_date}
    GROUP BY month;`
    const months = [
      { month: 'Jan', sum: '0' }, 
      { month: 'Feb', sum: '0'},
      { month: 'Mar', sum: '0'},
      { month: 'Apr', sum: '0'},
      { month: 'May', sum: '0'},
      { month: 'Jun', sum: '0'},
      { month: 'July', sum: '0'},
      { month: 'August', sum: '0'},
      { month: 'Sep', sum: '0'},
      { month: 'Nov', sum: '0'},
      { month: 'Dec', sum: '0'} ];

    result.map(value => {
      const monthIdx = new Date(value.month).getMonth();
      months[monthIdx].sum = value.sum; 
    })
    res.status(200).send(months);
  }

  @get('/service-sales')
  @queryValidator('company_id', 'start_date', 'end_date')
  async serviceSales (req: Request, res: Response) {
    let start_date = new Date();
    let end_date = new Date();
    if (typeof req.query.start_date === 'string' && typeof req.query.end_date === 'string') {
      start_date = new Date(req.query.start_date);
      end_date = new Date(req.query.end_date);
    }
    if (Number.isNaN(start_date.getFullYear()) || Number.isNaN(end_date.getFullYear())) {
      res.status(400).send({ message: 'start_date or end_date are incorrect!' });
      return;
    }
    const result = await prisma.$queryRaw`
      SELECT COALESCE(SUM(service_sales.total_amount - service_sales.sale_discount), 0)::text AS total_revenue
      FROM service_sales
      WHERE company_id = ${req.query.company_id}
        AND service_sales.created_at BETWEEN ${start_date} AND ${end_date}
    `;
    res.status(200).send(result);
  }
}
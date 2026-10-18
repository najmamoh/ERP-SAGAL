import { Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';

type Hit = { table: string; id: string; title: string; subtitle?: string; href: string };

const take = 8;

const contains = (q: string) => ({ contains: q, mode: 'insensitive' as const });

export const globalSearch = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const q = String(req.query.q ?? '').trim();
    if (q.length < 1) {
      res.status(200).json({ query: q, results: [] });
      return;
    }

    const user = req.user as any;
    const userCompanyId = user?.company_id as string | undefined;
    const roles: string[] = user?.roles || [];
    const isMainAdmin =
      !userCompanyId &&
      roles.some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));

    const numericId = /^\d+$/.test(q) ? parseInt(q, 10) : null;
    const companyFilter = !isMainAdmin && userCompanyId ? { company_id: userCompanyId } : {};
    const vendorCompany = !isMainAdmin && userCompanyId ? { vendors: { company_id: userCompanyId } } : {};

    const settled = await Promise.allSettled([
      prisma.companies.findMany({
        where: {
          ...(!isMainAdmin && userCompanyId ? { company_id: userCompanyId } : {}),
          OR: [
            { company_name: contains(q) },
            { company_email: contains(q) },
            { company_phone: contains(q) },
            { company_id: contains(q) },
          ],
        },
        select: { company_id: true, company_name: true, company_email: true },
        take,
        orderBy: { company_name: 'asc' },
      }),
      prisma.products.findMany({
        where: {
          OR: [
            { product_name: contains(q) },
            { product_code: contains(q) },
            { category: contains(q) },
            ...(numericId ? [{ product_id: numericId }] : []),
          ],
        },
        select: { product_id: true, product_name: true, product_code: true },
        take,
        orderBy: { product_name: 'asc' },
      }),
      prisma.vendors.findMany({
        where: {
          ...companyFilter,
          OR: [
            { vendor_name: contains(q) },
            { vendor_email: contains(q) },
            { vendor_phone: contains(q) },
            ...(numericId ? [{ vendor_id: numericId }] : []),
          ],
        },
        select: { vendor_id: true, vendor_name: true, vendor_email: true },
        take,
        orderBy: { vendor_name: 'asc' },
      }),
      prisma.customers.findMany({
        where: {
          ...companyFilter,
          OR: [
            { customer_name: contains(q) },
            { customer_phone: contains(q) },
            { customer_address: contains(q) },
            ...(numericId ? [{ customer_id: numericId }] : []),
          ],
        },
        select: { customer_id: true, customer_name: true, customer_phone: true },
        take,
        orderBy: { customer_name: 'asc' },
      }),
      prisma.employees.findMany({
        where: {
          ...companyFilter,
          OR: [
            { employee_name: contains(q) },
            { employee_phone: contains(q) },
            { employee_address: contains(q) },
            ...(numericId ? [{ employee_id: numericId }] : []),
          ],
        },
        select: { employee_id: true, employee_name: true, employee_phone: true },
        take,
        orderBy: { employee_name: 'asc' },
      }),
      prisma.product_purchases.findMany({
        where: {
          ...vendorCompany,
          OR: [
            { container_number: contains(q) },
            { products: { product_name: contains(q) } },
            { products: { product_code: contains(q) } },
            ...(numericId ? [{ purchase_id: numericId }] : []),
          ],
        },
        select: {
          purchase_id: true,
          container_number: true,
          products: { select: { product_name: true } },
        },
        take,
        orderBy: { purchase_id: 'desc' },
      }),
      prisma.product_sales.findMany({
        where: {
          ...(!isMainAdmin && userCompanyId
            ? { company_users: { company_id: userCompanyId } }
            : {}),
          OR: [
            { customers: { customer_name: contains(q) } },
            { warehouse_stock: { product: { product_name: contains(q) } } },
            { warehouse_stock: { product: { product_code: contains(q) } } },
            { product_purchases: { products: { product_name: contains(q) } } },
            ...(numericId ? [{ sale_id: numericId }] : []),
          ],
        },
        select: {
          sale_id: true,
          customers: { select: { customer_name: true } },
        },
        take,
        orderBy: { sale_id: 'desc' },
      }),
      prisma.stores.findMany({
        where: {
          OR: [
            { store_name: contains(q) },
            { location: contains(q) },
            { description: contains(q) },
            { store_id: contains(q) },
          ],
        },
        select: { store_id: true, store_name: true, location: true },
        take,
        orderBy: { store_name: 'asc' },
      }),
      prisma.warehouses.findMany({
        where: {
          ...companyFilter,
          OR: [
            { warehouse_name: contains(q) },
            { location: contains(q) },
            ...(numericId ? [{ warehouse_id: numericId }] : []),
          ],
        },
        select: { warehouse_id: true, warehouse_name: true, location: true },
        take,
        orderBy: { warehouse_name: 'asc' },
      }),
      prisma.company_users.findMany({
        where: {
          ...companyFilter,
          OR: [{ full_name: contains(q) }, { email: contains(q) }, ...(numericId ? [{ user_id: numericId }] : [])],
        },
        select: { user_id: true, full_name: true, email: true },
        take,
        orderBy: { full_name: 'asc' },
      }),
      isMainAdmin
        ? prisma.main_users.findMany({
            where: {
              OR: [{ full_name: contains(q) }, { email: contains(q) }, ...(numericId ? [{ id: numericId }] : [])],
            },
            select: { id: true, full_name: true, email: true },
            take,
            orderBy: { full_name: 'asc' },
          })
        : Promise.resolve([]),
      prisma.other_expenses.findMany({
        where: {
          ...companyFilter,
          OR: [{ item_name: contains(q) }, ...(numericId ? [{ expense_id: numericId }] : [])],
        },
        select: { expense_id: true, item_name: true, paid_amount: true },
        take,
        orderBy: { expense_id: 'desc' },
      }),
      prisma.invoice.findMany({
        where: {
          ...companyFilter,
          OR: [
            { invoice_number: contains(q) },
            { customer: { customer_name: contains(q) } },
          ],
        },
        select: { id: true, invoice_number: true, total_amount: true },
        take,
        orderBy: { issue_date: 'desc' },
      }),
      prisma.product_purchases.findMany({
        where: {
          ...vendorCompany,
          purchase_debt: { gt: 0 },
          OR: [
            { container_number: contains(q) },
            { products: { product_name: contains(q) } },
            { products: { product_code: contains(q) } },
            { vendors: { vendor_name: contains(q) } },
            ...(numericId ? [{ purchase_id: numericId }] : []),
          ],
        },
        select: {
          purchase_id: true,
          purchase_debt: true,
          products: { select: { product_name: true } },
          vendors: { select: { vendor_name: true } },
        },
        take,
        orderBy: { purchase_id: 'desc' },
      }),
      prisma.invoice.findMany({
        where: {
          ...companyFilter,
          sale_id: { not: null },
          status: { notIn: ['VOID', 'DRAFT'] },
          OR: [
            { invoice_number: contains(q) },
            { customer: { customer_name: contains(q) } },
          ],
        },
        select: {
          id: true,
          invoice_number: true,
          total_amount: true,
          total_paid_amount: true,
          customer: { select: { customer_name: true } },
        },
        take: 20,
        orderBy: { issue_date: 'desc' },
      }),
      prisma.treasury.findMany({
        where: {
          ...companyFilter,
          OR: [
            { company: { company_name: contains(q) } },
            { company: { company_id: contains(q) } },
            { company_id: contains(q) },
          ],
        },
        select: {
          id: true,
          balance: true,
          company_id: true,
          company: { select: { company_name: true } },
        },
        take,
        orderBy: { updated_at: 'desc' },
      }),
      prisma.moneyTransfer.findMany({
        where: {
          ...(!isMainAdmin && userCompanyId
            ? {
                OR: [
                  { sender_company_id: userCompanyId },
                  { receiver_company_id: userCompanyId },
                ],
              }
            : {}),
          OR: [
            { reference_id: contains(q) },
            { sender: { company_name: contains(q) } },
            { receiver_branch: { company_name: contains(q) } },
          ],
        },
        select: {
          id: true,
          reference_id: true,
          amount: true,
          status: true,
          sender: { select: { company_name: true } },
        },
        take,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const [
      companies,
      products,
      vendors,
      customers,
      employees,
      purchases,
      sales,
      stores,
      warehouses,
      companyUsers,
      mainUsers,
      expenses,
      invoices,
      payables,
      receivables,
      treasuries,
      transfers,
    ] = settled.map((r) => (r.status === 'fulfilled' ? r.value : []));

    const results: Hit[] = [
      ...(companies as any[]).map((c) => ({
        table: 'Companies',
        id: String(c.company_id),
        title: c.company_name,
        subtitle: c.company_email,
        href: `Companies`,
      })),
      ...(products as any[]).map((p) => ({
        table: 'Products',
        id: String(p.product_id),
        title: p.product_name,
        subtitle: p.product_code,
        href: `Products`,
      })),
      ...(vendors as any[]).map((v) => ({
        table: 'Vendors',
        id: String(v.vendor_id),
        title: v.vendor_name,
        subtitle: v.vendor_email,
        href: `Vendor`,
      })),
      ...(customers as any[]).map((c) => ({
        table: 'Customers',
        id: String(c.customer_id),
        title: c.customer_name,
        subtitle: c.customer_phone,
        href: `Sales`,
      })),
      ...(employees as any[]).map((e) => ({
        table: 'Employees',
        id: String(e.employee_id),
        title: e.employee_name,
        subtitle: e.employee_phone,
        href: `Employees`,
      })),
      ...(purchases as any[]).map((p) => ({
        table: 'Purchases',
        id: String(p.purchase_id),
        title: p.products?.product_name || `Purchase #${p.purchase_id}`,
        subtitle: p.container_number || `#${p.purchase_id}`,
        href: `Purchases/Details/${p.purchase_id}`,
      })),
      ...(sales as any[]).map((s) => ({
        table: 'Sales',
        id: String(s.sale_id),
        title: `Sale #${s.sale_id}`,
        subtitle: s.customers?.customer_name,
        href: `Sales`,
      })),
      ...(stores as any[]).map((s) => ({
        table: 'Stores',
        id: String(s.store_id),
        title: s.store_name,
        subtitle: s.location,
        href: `Stores`,
      })),
      ...(warehouses as any[]).map((w) => ({
        table: 'Warehouse',
        id: String(w.warehouse_id),
        title: w.warehouse_name,
        subtitle: w.location,
        href: `Warehouse`,
      })),
      ...(companyUsers as any[]).map((u) => ({
        table: 'Users',
        id: String(u.user_id),
        title: u.full_name,
        subtitle: u.email,
        href: `User`,
      })),
      ...(mainUsers as any[]).map((u) => ({
        table: 'Main Users',
        id: String(u.id),
        title: u.full_name,
        subtitle: u.email,
        href: `MainUsers`,
      })),
      ...(expenses as any[]).map((e) => ({
        table: 'Expenses',
        id: String(e.expense_id),
        title: e.item_name,
        subtitle: e.paid_amount != null ? String(e.paid_amount) : undefined,
        href: `Expenses`,
      })),
      ...(invoices as any[]).map((i) => ({
        table: 'Invoices',
        id: String(i.id),
        title: i.invoice_number,
        subtitle: i.total_amount != null ? String(i.total_amount) : undefined,
        href: `invoices/${i.id}`,
      })),
      ...(payables as any[]).map((p) => ({
        table: 'Payables',
        id: String(p.purchase_id),
        title: p.products?.product_name || `Purchase #${p.purchase_id}`,
        subtitle: `${p.vendors?.vendor_name || ''} · debt ${p.purchase_debt ?? 0}`.trim(),
        href: `Payables/payment/${p.purchase_id}`,
      })),
      ...((receivables as any[]).filter((r) => {
        const due = Number(r.total_amount || 0);
        const paid = Number(r.total_paid_amount || 0);
        return due - paid > 0.01;
      })).map((r) => ({
        table: 'Receiveable',
        id: String(r.id),
        title: r.invoice_number,
        subtitle: r.customer?.customer_name,
        href: `Receiveable`,
      })),
      ...(treasuries as any[]).map((t) => ({
        table: 'Treasury',
        id: String(t.id),
        title: t.company?.company_name || t.company_id,
        subtitle: t.balance != null ? `Balance ${t.balance}` : undefined,
        href: `Treasury`,
      })),
      ...(transfers as any[]).map((t) => ({
        table: 'Treasury',
        id: String(t.id),
        title: t.reference_id,
        subtitle: `${t.sender?.company_name || ''} · ${t.status}`.trim(),
        href: `Treasury`,
      })),
    ];

    res.status(200).json({ query: q, results });
  } catch (error) {
    console.error('globalSearch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

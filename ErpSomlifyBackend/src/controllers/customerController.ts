// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, get, post, put, del, use, bodyValidator, lengthValidator } from "../decorators";
// import { requestMustBeArray } from "../middlewares/common";

// enum Customers {
//   customer_name = 'customer_name',
//   customer_phone = 'customer_phone',
//   customer_address = 'customer_address',
//   company_id = 'company_id'
// }

// @controller('/api')
// class CustomerController {
//   @get('/customers')
//   async findAll (req: Request, res: Response) {
//     const customers = await prisma.customers.findMany({
//       where: {
//         company_id: String(req.query.company_id)
//       }
//     });
//     res.status(200).send(customers);
//   }
//   @get('/costomers/:id')
//   async findOne (req: Request, res: Response) {
//     const customer = await prisma.customers.findUnique({
//       where: { customer_id: parseInt(req.params.id)}
//     })
//     res.status(200).send(customer);
//   }
//   @post('/customers')
//   @bodyValidator(Customers.customer_name, Customers.customer_phone, Customers.customer_address, Customers.company_id)
//   @lengthValidator(255, Customers.customer_address)
//   @lengthValidator(64, Customers.customer_name, Customers.customer_phone)
//   @use(requestMustBeArray)
//   async create (req: Request, res: Response) {
//     const customer = await prisma.customers.createMany({
//       data: req.body
//     })
//     res.status(201).send(customer);
//   }
//   @put('/customers/:id')
//   @bodyValidator(Customers.customer_name, Customers.customer_phone, Customers.customer_address)
//   @lengthValidator(255, Customers.customer_address)
//   @lengthValidator(64, Customers.customer_name, Customers.customer_phone)
//   async update (req: Request, res: Response) {
//     const { customer_name, customer_phone, customer_address } = req.body;
//     const updatedCustomer = await prisma.customers.update({
//       where: { customer_id: parseInt(req.params.id)},
//       data: {
//         customer_name,
//         customer_phone,
//         customer_address,
//         updated_at: new Date()
//       }
//     })
//     res.status(200).send(updatedCustomer);
//   }
//   @del('/customers/:id')
//   async delete (req: Request, res: Response) {
//     const deletedCustomer = await prisma.customers.delete({
//       where: { customer_id: parseInt(req.params.id) }
//     })
//     res.status(204).send({ message: 'Deleted Successfully' })
//   }
// }


import { Request, Response } from "express";
import { prisma } from "../prisma";
import { Prisma } from '@prisma/client';
import { CustomUserRequest } from "../middlewares";

export const getAllCustomers = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const user = req.user as any;
    const companyId = (req.query.company_id as string) || user?.company_id;
    const roles = user?.roles || [];
    const isMainAdmin = !user?.company_id && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));

    if (!companyId && !isMainAdmin) {
      res.status(400).json({ message: 'Company ID is required' });
      return;
    }

    if (companyId) {
      const company = await prisma.companies.findUnique({
        where: { company_id: companyId }
      });
      if (company?.isBanned) {
        res.status(403).json({ error: 'This account is suspended' });
        return;
      }
    }

    const whereClause: Prisma.customersWhereInput = {
      ...(companyId ? { company_id: companyId } : {}),
      AND: search ? [
        {
          OR: [
            { customer_name: { contains: search as string, mode: 'insensitive' } },
            { customer_address: { contains: search as string, mode: 'insensitive' } },
            { customer_phone: { contains: search as string, mode: 'insensitive' } },
          ]
        }
      ] : undefined
    };

    const [total, customers] = await prisma.$transaction([
      prisma.customers.count({ where: whereClause }),
      prisma.customers.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(pageSize),
      })
    ]);

    res.status(200).json({ 
      data: customers, 
      total, 
      page: Number(page), 
      pageSize: Number(pageSize) 
    });
  } catch (error) {
    console.error(`Error fetching customers: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCustomer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const companyId = user?.company_id;
    const where: any = { customer_id: parseInt(req.params.id) };
    if (companyId) where.company_id = companyId;

    const customer = await prisma.customers.findFirst({
      where,
    });
    customer
      ? res.status(200).json(customer)
      : res.status(404).json({ message: "Customer not found" });
  } catch (error) {
    console.error(`Error fetching customer: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCustomers = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ message: "Request body must be an array" });
      return;
    }
    const user = req.user as any;
    const companyId = req.body[0]?.company_id || user?.company_id;
    if (!companyId) {
      res.status(400).json({ message: "Company ID is required" });
      return;
    }

    const customersWithCompany = req.body.map((customer: any) => ({
      ...customer,
      company_id: customer.company_id || companyId,
    }));

    for (const customer of customersWithCompany) {
      if (!customer.customer_name || typeof customer.customer_name !== 'string' || !customer.customer_name.trim()) {
        res.status(400).json({ message: "Customer name is required" });
        return;
      }
      // Ensure optional fields are strings (phone and address can be empty)
      customer.customer_phone = customer.customer_phone != null ? String(customer.customer_phone) : '';
      customer.customer_address = customer.customer_address != null ? String(customer.customer_address) : '';
    }

    const createdCustomers = await prisma.customers.createMany({ data: customersWithCompany });
    res.status(201).json(createdCustomers);
  } catch (error) {
    console.error(`Error creating customers: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCustomer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { customer_name, customer_phone, customer_address } = req.body;
    const customerId = parseInt(req.params.id);
    const user = req.user as any;
    const where: any = { customer_id: customerId };
    if (user?.company_id) where.company_id = user.company_id;

    if (!customer_name || !customer_phone || !customer_address) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existing = await prisma.customers.findFirst({ where });
    if (!existing) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    const updatedCustomer = await prisma.customers.update({
      where: { customer_id: customerId },
      data: {
        customer_name,
        customer_phone,
        customer_address,
        updated_at: new Date(),
      },
    });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error(`Error updating customer: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCustomer = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const where: any = { customer_id: parseInt(req.params.id) };
    if (user?.company_id) where.company_id = user.company_id;

    const existing = await prisma.customers.findFirst({ where });
    if (!existing) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }
    await prisma.customers.delete({
      where: { customer_id: parseInt(req.params.id) },
    });
    res.status(204).json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error(`Error deleting customer: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

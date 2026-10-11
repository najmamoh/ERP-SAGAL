// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, get, post, put, del, use, bodyValidator, lengthValidator, queryValidator } from "../decorators";
// import { requestMustBeArray } from "../middlewares/common";

// enum Employees {
//   employee_name = 'employee_name',
//   employee_address = 'employee_address',
//   employee_phone = 'employee_phone',
//   salary_amount = 'salary_amount',
//   company_id = 'company_id'
// }

// @controller('/api')
// class VendorController {
//   @get('/employees')
//   @queryValidator('company_id')
//   async findAll (req: Request, res: Response) {
//     const employees = await prisma.employees.findMany({
//       where: {
//         company_id: String(req.query.company_id)
//       }
//     });
//     res.status(200).send(employees);
//   }
//   @get('/employees/:id')
//   async findOne (req: Request, res: Response) {
//     const employee = await prisma.employees.findUnique({
//       where: { employee_id: parseInt(req.params.id) }
//     })
//     res.status(200).send(employee);
//   }
//   @post('/employees')
//   @bodyValidator(Employees.employee_name, Employees.employee_address, Employees.employee_phone, Employees.salary_amount, Employees.company_id)
//   @lengthValidator(255, Employees.employee_address, Employees.salary_amount)
//   @lengthValidator(64, Employees.employee_name, Employees.employee_phone)
//   @use(requestMustBeArray)
//   async create (req: Request, res: Response) {
//     const employee = await prisma.employees.createMany({
//       data: req.body
//     })
//     res.status(201).send(employee);
//   }
//   @put('/employees/:id')
//   @bodyValidator(Employees.employee_name, Employees.employee_address, Employees.employee_phone, Employees.salary_amount)
//   @lengthValidator(255, Employees.employee_address, Employees.salary_amount)
//   @lengthValidator(64, Employees.employee_name, Employees.employee_phone)
//   async update (req: Request, res: Response) {
//     const { employee_name, employee_address, employee_phone, salary_amount, company_id } = req.body;
//     const updatedEmployee = await prisma.employees.update({
//       where: { employee_id: parseInt(req.params.id) },
//       data: {
//         employee_name,
//         employee_address,
//         employee_phone,
//         salary_amount,
//         updated_at: new Date()
//       }
//     })
//     res.status(200).send(updatedEmployee);
//   }
//   @del('/employees/:id')
//   async delete (req: Request, res: Response) {
//     const deletedEmployee = await prisma.employees.delete({
//       where: { employee_id: parseInt(req.params.id)}
//     })
//     res.status(204).send({ message: 'Deleted Successfully' });
//   }
// }


import { Request, Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";

export const getAllEmployees = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const roles = user?.roles || [];
    const isMainAdmin = !user?.company_id && (roles.includes('admin') || roles.includes('superAdmin') || roles.includes('super_admin'));
    const companyIdFilter = (req.query.company_id as string)?.trim();
    const companyId = companyIdFilter || user?.company_id;

    if (!companyId && !isMainAdmin) {
      res.status(400).json({ message: "Company ID is required (query or auth)." });
      return;
    }

    const where: { company_id?: string } = {};
    if (companyId) where.company_id = companyId;

    const employees = await prisma.employees.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        companies: {
          select: { company_id: true, company_name: true },
        },
      },
    });
    res.status(200).json(employees);
  } catch (error) {
    console.error(`Error fetching employees: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getEmployee = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const isMainAdmin = !user?.company_id && (user?.roles || []).some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));
    const companyId = (req.query.company_id as string) || user?.company_id;
    if (!companyId && !isMainAdmin) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const whereClause: any = { employee_id: parseInt(req.params.id) };
    if (companyId) whereClause.company_id = companyId;
    const employee = await prisma.employees.findFirst({
      where: whereClause,
    });
    employee
      ? res.status(200).json(employee)
      : res.status(404).json({ message: "Employee not found" });
  } catch (error) {
    console.error(`Error fetching employee: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createEmployees = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const bodyArray = Array.isArray(req.body) ? req.body : [req.body];
    const defaultCompanyId = bodyArray[0]?.company_id || user?.company_id;

    if (!defaultCompanyId) {
      res.status(400).json({ message: 'Company ID is required (body or auth).' });
      return;
    }

    const employeesWithCompany = bodyArray.map((employee: any) => ({
      ...employee,
      company_id: employee.company_id || defaultCompanyId,
    }));

    for (const employee of employeesWithCompany) {
      if (!employee.employee_name || !employee.employee_address ||
          !employee.employee_phone || !employee.salary_amount) {
        res.status(400).json({ message: "Missing required fields in one or more employees" });
        return;
      }
    }

    const createdEmployees = await prisma.employees.createMany({
      data: employeesWithCompany,
    });
    res.status(201).json(createdEmployees);
  } catch (error) {
    console.error(`Error creating employees: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEmployee = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const isMainAdmin = !user?.company_id && (user?.roles || []).some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));
    const companyId = req.body.company_id || user?.company_id;
    if (!companyId && !isMainAdmin) {
      res.status(400).json({ message: 'Company ID is required (body or auth).' });
      return;
    }
    const { employee_name, employee_address, employee_phone, salary_amount } = req.body;
    const employeeId = parseInt(req.params.id);

    if (!employee_name || !employee_address || !employee_phone || !salary_amount) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingWhere: any = { employee_id: employeeId };
    if (companyId) existingWhere.company_id = companyId;
    const existing = await prisma.employees.findFirst({
      where: existingWhere,
    });
    if (!existing) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    const updatedEmployee = await prisma.employees.update({
      where: { employee_id: employeeId },
      data: {
        employee_name,
        employee_address,
        employee_phone,
        salary_amount,
        updated_at: new Date(),
      },
    });
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(`Error updating employee: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteEmployee = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const isMainAdmin = !user?.company_id && (user?.roles || []).some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));
    const companyId = (req.query.company_id as string) || user?.company_id;
    if (!companyId && !isMainAdmin) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }
    const existingWhere: any = { employee_id: parseInt(req.params.id) };
    if (companyId) existingWhere.company_id = companyId;
    const existing = await prisma.employees.findFirst({
      where: existingWhere,
    });
    if (!existing) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    await prisma.employees.delete({
      where: { employee_id: parseInt(req.params.id) },
    });
    res.status(204).json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error(`Error deleting employee: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
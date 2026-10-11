// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, get, post, put, del, bodyValidator, lengthValidator, queryValidator } from "../decorators";
// enum Salaries {
//   paid_amount =  'paid_amount',
//   date = 'date',
//   employee_id = 'employee_id'
// }

// @controller('/api')
// class VendorController {
//   @get('/salaries')
//   @queryValidator('company_id', 'page_number', 'page_size')
//   async findAll (req: Request, res: Response) {
//     const salaries = await prisma.salaries.findMany({
//       include: {
//         employees: true
//       },
//       where: {
//         employees: { company_id: String(req.query.company_id) }
//       },
//       skip: (Number(req.query.page_number) - 1) * Number(req.query.page_size),
//       take: Number(req.query.page_size)
//     })
//     res.status(200).send(salaries);
//   }
//   @get('/salaries/:id')
//   async findOne (req: Request, res: Response) {
//     const salary = await prisma.salaries.findUnique({
//       where: { salary_id: parseInt(req.params.id) }
//     })
//     res.status(200).send(salary);
//   }
//   @post('/salaries')
//   @bodyValidator(Salaries.paid_amount, Salaries.date, Salaries.employee_id)
//   @lengthValidator(255, Salaries.paid_amount, Salaries.date, Salaries.employee_id)
//   async create (req: Request, res: Response) {
//     const { paid_amount, date, employee_id } = req.body;
//     const salary = await prisma.salaries.create({
//       data: {
//         paid_amount,
//         date: new Date(date + ' 12:00'),
//         employees: {
//           connect: { employee_id }
//         }
//       }
//     })
//     res.status(201).send(salary);
//   }
//   @put('/salaries/:id')
//   @bodyValidator(Salaries.paid_amount, Salaries.date, Salaries.employee_id)
//   @lengthValidator(255, Salaries.paid_amount, Salaries.date, Salaries.employee_id)
//   async update (req: Request, res: Response) {
//     const { paid_amount, date, employee_id } = req.body;
//     const employee = await prisma.salaries.update({
//       where: { salary_id: parseInt(req.params.id) },
//       data: {
//         paid_amount,
//         date: new Date(date),
//         updated_at: new Date(),
//         employees: {
//           connect: { employee_id }
//         }
//       }
//     })
//     res.status(200).send(employee);
//   }
//   @del('/salaries/:id')
//   async delete (req: Request, res: Response) {
//     const deletedSalary = await prisma.salaries.delete({
//       where: { salary_id: parseInt(req.params.id)}
//     })
//     res.status(204).send({ message: 'Deleted Successfully' });
//   }
// }


import { Request, Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";

export const getAllSalaries = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const companyId = (req.query.company_id as string) || (req.user as any)?.company_id;
    if (!companyId) {
      res.status(400).json({ message: 'Company ID is required (query or auth).' });
      return;
    }

    const pageNumber = parseInt(req.query.page_number as string) || 1;
    const pageSize = parseInt(req.query.page_size as string) || 10;

    const salaries = await prisma.salaries.findMany({
      include: { employees: true },
      where: { employees: { company_id: companyId } },
      orderBy: [{ created_at: 'desc' }, { salary_id: 'desc' }],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
    res.status(200).json(salaries);
  } catch (error) {
    console.error(`Error fetching salaries: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSalary = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const companyId = user?.company_id;
    const salary = await prisma.salaries.findFirst({
      where: {
        salary_id: parseInt(req.params.id),
        ...(companyId ? { employees: { company_id: companyId } } : {}),
      },
      include: { employees: true },
    });

    if (!salary) {
      res.status(404).json({ message: "Salary not found" });
      return;
    }

    res.status(200).json(salary);
  } catch (error) {
    console.error(`Error fetching salary: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSalary = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const { paid_amount, date, employee_id } = req.body;
    if (!paid_amount || !date || !employee_id) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const employee = await prisma.employees.findUnique({
      where: { employee_id: Number(employee_id) },
    });

    if (!employee) {
      res.status(400).json({ message: "Invalid employee ID" });
      return;
    }

    if (user?.company_id && employee.company_id !== user.company_id) {
      res.status(400).json({ message: "Invalid employee ID" });
      return;
    }

    const salary = await prisma.salaries.create({
      data: {
        paid_amount,
        date: new Date(date + ' 12:00'),
        employee_id,
      },
    });
    res.status(201).json(salary);
  } catch (error) {
    console.error(`Error creating salary: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSalary = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const { paid_amount, date, employee_id } = req.body;
    const salaryId = parseInt(req.params.id);
    const where: any = { salary_id: salaryId };
    if (user?.company_id) where.employees = { company_id: user.company_id };

    const existingSalary = await prisma.salaries.findFirst({
      where,
      include: { employees: true },
    });

    if (!existingSalary) {
      res.status(404).json({ message: "Salary not found" });
      return;
    }

    if (employee_id) {
      const newEmployee = await prisma.employees.findUnique({
        where: { employee_id: Number(employee_id) },
      });
      if (!newEmployee) {
        res.status(400).json({ message: "Invalid employee ID" });
        return;
      }
      if (user?.company_id && newEmployee.company_id !== user.company_id) {
        res.status(400).json({ message: "Invalid employee ID" });
        return;
      }
    }

    const updatedSalary = await prisma.salaries.update({
      where: { salary_id: salaryId },
      data: {
        paid_amount,
        date: date ? new Date(date) : undefined,
        employee_id,
        updated_at: new Date(),
      },
    });
    res.status(200).json(updatedSalary);
  } catch (error) {
    console.error(`Error updating salary: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSalary = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const where: any = { salary_id: parseInt(req.params.id) };
    if (user?.company_id) where.employees = { company_id: user.company_id };

    const existingSalary = await prisma.salaries.findFirst({
      where,
      include: { employees: true },
    });

    if (!existingSalary) {
      res.status(404).json({ message: "Salary not found" });
      return;
    }

    await prisma.salaries.delete({
      where: { salary_id: parseInt(req.params.id) },
    });
    res.status(204).json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error(`Error deleting salary: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
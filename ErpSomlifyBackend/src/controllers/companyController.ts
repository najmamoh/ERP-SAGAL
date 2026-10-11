// import { Request, Response } from "express";
// import { randomBytes } from 'crypto';
// import { prisma } from "../prisma";
// import { controller, get, post, put, del, bodyValidator, lengthValidator, uniqueValidator, existanceValidator } from "../decorators";
// import { Tables } from "../config/Tables";

// @controller('/api')
// class CompanyController {
//   @get('/companies')
//   async findAll (req: Request, res: Response) {
//     const companies = await prisma.companies.findMany();
//     res.status(200).send(companies);
//   }

//   @get('/companies/:id')
//   async findOne (req: Request, res: Response) {
//     const company = await prisma.companies.findUnique({
//       where: { company_id: req.params.id }
//     })
//     res.status(200).send(company);
//   }

//   @post('/companies')
//   @bodyValidator('company_name', 'company_address', 'company_email', 'taxable')
//   @lengthValidator(255, 'company_name', 'company_email')
//   @uniqueValidator(Tables.companies, 'company_email')
//   async create(req: Request, res: Response) {
//     const { company_name, company_address, company_email } = req.body;
//     const company_id = randomBytes(6).toString('hex');
//     const newCompany = await prisma.companies.create({
//       data: {
//         company_id,
//         company_name,
//         company_address,
//         company_email,
//         subscribtion_fee: req.body.subscribtion_fee || 30,
//         taxable: req.body.taxable || false,
//         tax_percentage: req.body.tax_percentage || 5
//       }
//     })
//     res.status(201).send(newCompany)
//   }

//   @put('/companies/:id')
//   @bodyValidator('company_name', 'company_address', 'company_email')
//   async update (req: Request, res: Response) {
//     const { company_name, company_address, company_email} = req.body;
//     const updatedCompany = await prisma.companies.update({
//       where: { company_id: req.params.id},
//       data: {
//         company_name,
//         company_email,
//         company_address,
//         taxable: req.body.taxable || false,
//         tax_percentage: req.body.tax_percentage || 5,
//         subscribtion_fee: req.body.subscribtion_fee || 30,
//         updated_at: new Date()
//       }
//     })
//     res.status(200).send(updatedCompany);
//   }

//   @del('/companies/:id')
//   async delete (req: Request, res: Response) {
//     const deletedCompany = await prisma.companies.delete({
//       where: { company_id: req.params.id }
//     })
//     res.status(204).send({ message: 'Deleted Successfully' })
//   }
// }

import { Request, Response } from "express";
import { randomBytes } from 'crypto';
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import bcrypt from 'bcrypt';

export const getAllCompanies = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // if (req.user!.role !== 'superAdmin') {
    //   res.status(403).json({ message: 'Forbidden! Insufficient permissions' });
    //   return;
    // }

    const companies = await prisma.companies.findMany({
      orderBy: [{ created_at: 'desc' }, { company_id: 'desc' }],
    });
    res.status(200).json(companies);
  } catch (error) {
    console.error(`Error fetching companies: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCompany = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const company = await prisma.companies.findUnique({
      where: { company_id: req.params.id }
    });

    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    res.status(200).json(company);
  } catch (error) {
    console.error(`Error fetching company: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCompany = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // if (req.user!.role !== 'superAdmin') {
    //   res.status(403).json({ message: 'Forbidden! Insufficient permissions' });
    //   return;
    // }

    const { company_name, company_address, company_email, company_phone } = req.body;
    
    // Validation
    if (!company_name || !company_address || !company_email ||!company_phone) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    if (company_name.length > 255 || company_email.length > 255) {
      res.status(400).json({ message: 'Field exceeds maximum length (255 characters)' });
      return;
    }

    // Check for existing email
    const existingCompany = await prisma.companies.findUnique({
      where: { company_email }
    });

    if (existingCompany) {
      res.status(409).json({ message: 'Company email already exists' });
      return;
    }

    const company_id = randomBytes(6).toString('hex');
    const newCompany = await prisma.$transaction(async (tx) => {
      const company = await tx.companies.create({
        data: {
          company_id,
          company_name,
          company_address,
          company_email,
          company_phone,
          subscribtion_fee: req.body.subscribtion_fee || 30,
          taxable: req.body.taxable || false,
          tax_percentage: req.body.tax_percentage || 5
        }
      });
      // Do not auto-create a warehouse; user can create warehouses separately when needed.
      return company;
    });

    res.status(201).json(newCompany);
  } catch (error) {
    console.error(`Error creating company: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCompany = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden! Insufficient permissions' });
      return;
    }

    const { company_name, company_address, company_email,company_phone,subscribtion_fee ,taxable,isBanned} = req.body;
      console.log("hel",req.body)
    if (!company_name || !company_address || !company_email) {
      res.status(400).json({ message: 'Missing required field' });
      return;
    }

    const updatedCompany = await prisma.companies.update({
      where: { company_id: req.params.id },
      data: {
        company_name,
        company_email,
        company_address,
        company_phone,
        isBanned:req.body.isBanned,
        taxable: req.body.taxable || false,
        tax_percentage: req.body.tax_percentage || 5,
        subscribtion_fee: req.body.subscribtion_fee || 30,
        updated_at: new Date()
      }
    });

    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error(`Error updating company: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCompany = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden! Insufficient permissions' });
      return;
    }

    await prisma.companies.delete({
      where: { company_id: req.params.id }
    });

    res.status(204).json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error(`Error deleting company: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//create companyUser
export const CreateComUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { full_name, email, password, role: roleName, company_id } = req.body;
    if (!req.user!.roles?.includes('superAdmin') && !req.user!.roles?.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden! you don/t have permission' });
      return;
    }
   console.log(req.body)
    if (!full_name || !email || !password || !roleName || !company_id) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const user = await prisma.company_users.findUnique({ where: { email } });
    if(user){
      res.status(400).json({ message: 'Email is already taken' });
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleDef = await prisma.roleDefinition.findFirst({ where: { name: String(roleName) } });
    if (!roleDef) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }
    const newUser = await prisma.company_users.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        company_id,
        user_roles: {
          create: { role_id: roleDef.id, company_id },
        },
      },
    });

    res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (error) {
    console.error(`Error during signup: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

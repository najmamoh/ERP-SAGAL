// import { Request, Response } from "express";
// import { prisma } from "../prisma";
// import { controller, get, post, put, del, bodyValidator, lengthValidator, existanceValidator, queryValidator } from "../decorators";
// import { Tables } from "../config/Tables";

// @controller('/api')
// class VendorController {
//   @get('/vendors')
//   @queryValidator('company_id')
//   async findAll (req: Request, res: Response) {
//     const vendors = await prisma.vendors.findMany({
//       where: {
//         company_id: String(req.query.company_id)
//       }
//     });
//     res.status(200).send(vendors);
//   }
//   @get('/vendors/:id')
//   async findOne (req: Request, res: Response) {
//     const vendor = await prisma.vendors.findUnique({
//       where: { vendor_id: parseInt(req.params.id) }
//     })
//     res.status(200).send(vendor);
//   }
//   @post('/vendors')
//   @bodyValidator('vendor_name', 'vendor_address', 'vendor_email', 'vendor_phone', 'company_id')
//   @lengthValidator(255, 'vendor_name', 'vendor_address', 'vendor_email')
//   @lengthValidator(64, 'vendor_phone')
//   async create (req: Request, res: Response) {
//     if (!Array.isArray(req.body)) {
//       return res.status(400).send({ message: 'req body must be array' });
//     }
//     const vendor = await prisma.vendors.createMany({
//       data: req.body
//     })
//     res.status(201).send(vendor);
//   }
//   @put('/vendors/:id')
//   @bodyValidator('vendor_name', 'vendor_address', 'vendor_email', 'vendor_phone')
//   @lengthValidator(255, 'vendor_name', 'vendor_address', 'vendor_email')
//   @lengthValidator(64, 'vendor_phone')
//   async update (req: Request, res: Response) {
//     const { vendor_name, vendor_address, vendor_email, vendor_phone } = req.body;
//     const updatedVendor = await prisma.vendors.update({
//       where: { vendor_id: parseInt(req.params.id)},
//       data: {
//         vendor_name,
//         vendor_address,
//         vendor_email,
//         vendor_phone,
//         updated_at: new Date()
//       }
//     })
//     res.status(200).send(updatedVendor);
//   }
//   @del('/vendors/:id')
//   async delete (req: Request, res: Response) {
//     const deletedVendor = await prisma.vendors.delete({
//       where: { vendor_id: parseInt(req.params.id)}
//     })
//     res.status(204).send({ message: 'Deleted Successfully' });
//   }
// }


import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';
import { Prisma,  } from '@prisma/client';

// export const getAllVendors = async (req: CustomUserRequest, res: Response): Promise<void> => {
//   try {
//     const vendors = await prisma.vendors.findMany({
//       where: { company_id: req.user!.company_id }
//     });
//     res.status(200).json(vendors);
//   } catch (error) {
//     console.error(`Error fetching vendors: ${error}`);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



export const getAllVendors = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    // 1) pagination & search parsing
    const page     = parseInt(req.query.page  as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
    const search   = (req.query.search as string || '').trim();
    const skip     = (page - 1) * pageSize;
    const companyIdFilter = req.query.company_id as string | undefined;

    // 2) Check if user is admin/superAdmin (main user) - they don't have company_id
    // Admin users have role 'admin' or 'superAdmin' but no company_id
    const userCompanyId = (req.user as any)?.company_id;
    // Check if user has admin or superAdmin role (main admin users don't have company_id)
    const userRoles = req.user?.roles || [];
    const isMainAdmin = !userCompanyId && (userRoles.includes('admin') || userRoles.includes('superAdmin'));
    
    // 3) build a properly-typed where clause
    const where: Prisma.vendorsWhereInput = {};
    
    // For admin users: show all vendors, optionally filter by company_id if provided
    if (isMainAdmin) {
      if (companyIdFilter) {
        where.company_id = companyIdFilter;
      }
      // If no company_id filter, show all vendors (company_id can be null or any value)
    } else {
      // For normal users: only show vendors from their company
      where.company_id = req.user!.company_id;
    }

    if (search) {
      where.OR = [
        { vendor_name: { contains: search, mode: 'insensitive' } },
        { vendor_phone: { contains: search, mode: 'insensitive' } },
        { vendor_email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 4) single round-trip: get total + page of rows
    const [total, vendors] = await prisma.$transaction([
      prisma.vendors.count({ where }),
      prisma.vendors.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { vendor_id: 'desc' }],
        skip,
        take: pageSize,
      }),
    ]);

    // 5) metadata
    const hasMore = skip + vendors.length < total;

    res.status(200).json({
      data: vendors,
      total,
      page,
      pageSize,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const getVendor = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin/superAdmin (main user) - they don't have company_id
    const userCompanyId = (req.user as any)?.company_id;
    // Check if user has admin or superAdmin role (main admin users don't have company_id)
    const userRoles = req.user?.roles || [];
    const isMainAdmin = !userCompanyId && (userRoles.includes('admin') || userRoles.includes('superAdmin'));
    
    const where: Prisma.vendorsWhereInput = {
      vendor_id: parseInt(req.params.id),
    };
    
    // For normal users, filter by company_id
    if (!isMainAdmin && userCompanyId) {
      where.company_id = userCompanyId;
    }
    
    const vendor = await prisma.vendors.findFirst({ where });
    vendor ? res.status(200).json(vendor) : res.status(404).json({ message: 'Vendor not found' });
  } catch (error) {
    console.error(`Error fetching vendor: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createVendors = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ message: 'Request body must be an array' });
      return;
    }

    // Check if user is admin/superAdmin (main user) - they don't have company_id
    const userCompanyId = (req.user as any)?.company_id;
    // Check if user has admin or superAdmin role (main admin users don't have company_id)
    const userRoles = req.user?.roles || [];
    const isMainAdmin = !userCompanyId && (userRoles.includes('admin') || userRoles.includes('superAdmin'));
    
    // Prepare vendors data
    const vendorsData = req.body.map(vendor => {
      const vendorData: any = {
        vendor_name: vendor.vendor_name,
        vendor_address: vendor.vendor_address,
        vendor_email: vendor.vendor_email,
        vendor_phone: vendor.vendor_phone,
      };
      
      // Company_id is now optional for ALL users (main users and regular users)
      // Users can create vendors without company association
      vendorData.company_id = vendor.company_id || null;
      
      return vendorData;
    });

    // Validate each vendor object
    for (const vendor of vendorsData) {
      if (!vendor || typeof vendor !== 'object') {
        res.status(400).json({ message: 'Invalid vendor data format' });
        return;
      }
      
      if (!vendor.vendor_name || !vendor.vendor_address || 
          !vendor.vendor_email || !vendor.vendor_phone) {
        res.status(400).json({ message: 'Missing required fields in one or more vendors' });
        return;
      }
      
      if (vendor.vendor_name.length > 255 || vendor.vendor_address.length > 255 || 
          vendor.vendor_email.length > 255) {
        res.status(400).json({ message: 'Field exceeds 255 character limit' });
        return;
      }

      if (vendor.vendor_phone.length > 64) {
        res.status(400).json({ message: 'Phone number exceeds 64 character limit' });
        return;
      }
    }

    const createdVendors = await prisma.vendors.createMany({ data: vendorsData });
    res.status(201).json(createdVendors);
  } catch (error) {
    console.error(`Error creating vendors: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateVendor = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { vendor_name, vendor_address, vendor_email, vendor_phone, company_id } = req.body;
    
    if (!vendor_name || !vendor_address || !vendor_email || !vendor_phone) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    if ([vendor_name, vendor_address, vendor_email].some(field => field.length > 255)) {
      res.status(400).json({ message: 'Field exceeds 255 character limit' });
      return;
    }

    if (vendor_phone.length > 64) {
      res.status(400).json({ message: 'Phone number exceeds 64 character limit' });
      return;
    }

    // Check if user is admin/superAdmin (main user) - they don't have company_id
    const userCompanyId = (req.user as any)?.company_id;
    // Check if user has admin or superAdmin role (main admin users don't have company_id)
    const userRoles = req.user?.roles || [];
    const isMainAdmin = !userCompanyId && (userRoles.includes('admin') || userRoles.includes('superAdmin'));
    
    // First, check if vendor exists and user has permission
    const existingVendor = await prisma.vendors.findUnique({
      where: { vendor_id: parseInt(req.params.id) }
    });
    
    if (!existingVendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }
    
    // For normal users, verify vendor belongs to their company
    if (!isMainAdmin && userCompanyId && existingVendor.company_id !== userCompanyId) {
      res.status(403).json({ message: 'Forbidden: You can only update vendors from your company' });
      return;
    }

    // Prepare update data
    const updateData: any = {
      vendor_name,
      vendor_address,
      vendor_email,
      vendor_phone,
      updated_at: new Date()
    };
    
    // Admin users can update company_id if provided
    if (isMainAdmin && company_id !== undefined) {
      updateData.company_id = company_id || null;
    }

    const updatedVendor = await prisma.vendors.update({
      where: { vendor_id: parseInt(req.params.id) },
      data: updateData
    });
    
    res.status(200).json(updatedVendor);
  } catch (error) {
    console.error(`Error updating vendor: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteVendor = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // if (!req.user || (req.user.role !== 'user' && req.user.role !== 'superAdmin')) {
    //   res.status(403).json({ message: 'Forbidden: Insufficient permissions con' });
    //   return;
    // }
    await prisma.vendors.delete({
      where: { 
        vendor_id: parseInt(req.params.id),
        // company_id: req.user!.company_id 
      }
    });
    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error(`Error deleting vendor: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
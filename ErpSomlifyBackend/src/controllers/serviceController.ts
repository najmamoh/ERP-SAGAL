import { Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { Prisma } from "@prisma/client";

/* ================= GET ALL SERVICES ================= */
export const getAllServices = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    // Only superAdmin can access
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! You don't have permission" });
      return;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    // Build type-safe where clause
    const where: Prisma.ServiceWhereInput = {
      company_id: req.user!.company_id,
      is_deleted: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } }, // search in service name
          { Job: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } }, // search in related job name
        ],
      }),
    };

    // Fetch data and total count in parallel
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: { Job: true },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    // Return paginated response
    res.status(200).json({
      data: services,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/* ================= CREATE SERVICE ================= */
export const createService = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! you don't have permission" });
      return;
    }

    const { job_id, name, unit, unit_price } = req.body;

    if (!job_id || !name || !unit || !unit_price) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const service = await prisma.service.create({
      data: {
        job_id,
        name,
        unit,
        unit_price,
        company_id: req.user!.company_id,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error(`Error creating service: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE SERVICE ================= */
export const updateService = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! you don't have permission" });
      return;
    }

    const { name, unit, unit_price } = req.body;

    const updatedService = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        name,
        unit,
        unit_price,
        updated_at: new Date(),
      },
    });

    res.status(200).json(updatedService);
  } catch (error) {
    console.error(`Error updating service: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= DELETE SERVICE (SOFT) ================= */
export const deleteService = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! you don't have permission" });
      return;
    }

    await prisma.service.update({
      where: { id: req.params.id },
      data: { is_deleted: true },
    });

    res.status(204).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(`Error deleting service: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

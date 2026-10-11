import { Request, Response } from "express";
import { prisma } from "../prisma";
import { CustomUserRequest } from "../middlewares";
import { Prisma } from "@prisma/client";

/* ================= GET ALL JOBS ================= */
export const getAllJobs = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! you don't have permission" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const skip = (page - 1) * limit;

    const where: Prisma.JobsWhereInput = {
      company_id: req.user!.company_id,
      is_deleted: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.jobs.findMany({
        where,
        include: { services: true },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.jobs.count({ where }),
    ]);

    res.status(200).json({
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(`Error fetching jobs: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};


/* ================= GET SINGLE JOB ================= */
export const getJob = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! you don't have permission" });
      return;
    }

    const job = await prisma.jobs.findFirst({
      where: {
        id: req.params.id,
        company_id: req.user!.company_id,
        is_deleted: false,
      },
      include: {
        services: true,
      },
    });

    job
      ? res.status(200).json(job)
      : res.status(404).json({ message: "Job not found" });
  } catch (error) {
    console.error(`Error fetching job: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= CREATE JOB ================= */
export const createJob = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! you don't have permission" });
      return;
    }

    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Job name is required" });
      return;
    }

    const job = await prisma.jobs.create({
      data: {
        name,
        description,
        company_id: req.user!.company_id,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(`Error creating job: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE JOB ================= */
export const updateJob = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! you don't have permission" });
      return;
    }

    const { name, description } = req.body;

    const updatedJob = await prisma.jobs.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        updated_at: new Date(),
      },
    });

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error(`Error updating job: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= DELETE JOB (SOFT) ================= */
export const deleteJob = async (
  req: CustomUserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user!.roles?.includes("superAdmin") && !req.user!.roles?.includes("super_admin")) {
      res.status(403).json({ message: "Forbidden! you don't have permission" });
      return;
    }

    await prisma.jobs.update({
      where: { id: req.params.id },
      data: { is_deleted: true },
    });

    res.status(204).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(`Error deleting job: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

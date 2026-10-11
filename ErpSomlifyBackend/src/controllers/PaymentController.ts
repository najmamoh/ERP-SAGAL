import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { CustomUserRequest } from "../middlewares";

export const createPayment = async (req: CustomUserRequest, res: Response): Promise<void> => {
    res.status(501).json({ message: "Not implemented" });
};

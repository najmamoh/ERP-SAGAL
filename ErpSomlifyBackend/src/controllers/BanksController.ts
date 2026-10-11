import { Request,Response } from "express";
import { CustomUserRequest } from "../middlewares";
import { prisma } from '../prisma';
import { Decimal } from "@prisma/client/runtime/library";


//Create Banks
export const CreateBanks = async(req:CustomUserRequest,res:Response): Promise<void>=>{

    try{
        const {bank_name,amount, created_at}=req.body;

        if (!bank_name){
             res.status(400).json({message:"Bank name,created_at are required"})
        return}

            const NewBank = await prisma.banks.create({
                data:{
                   bank_name,
                   amount, 
                   created_at 
                }
            })
             res.status(201).json(({message:"Bank created successfully", bank: NewBank}))
                  return  }
                    catch (error){
                         res.status(500).json({message:"Internal server error", error})
                   return }
    };

    // get AllBnks

 

export const getAllBanks = async (req: Request, res: Response) => {
  try {
        const page = parseInt(req.query.page as string) || 1;

        const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    const banks = await prisma.banks.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      message: "Banks fetched successfully",
      banks,
     take: pageSize,

    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};


//get one

export const GetoneeBank = async (req: Request, res: Response) => {
 try {
    const product = await prisma.banks.findFirst({
      where: { 
        bank_id: parseInt(req.params.id),
      },
     
    });
    product ? res.status(200).json(product) : res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    console.error(`Error fetching product: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Delete


export const DeleteBank = async (req: Request, res: Response) => {
  try {
    const bank_id = Number(req.params.id);

    const bank = await prisma.banks.findUnique({
      where: { bank_id },
    });

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    const amount = bank.amount ?? new Decimal(0); 
    if (amount.gt(0)) {
      return res.status(400).json({
        message: "Bank cannot be deleted because amount is greater than 0",
      });
    }

    await prisma.banks.delete({
      where: { bank_id },
    });

    return res.status(200).json({
      message: "Bank deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
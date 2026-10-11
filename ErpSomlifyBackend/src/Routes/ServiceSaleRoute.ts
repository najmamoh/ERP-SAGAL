import express from "express";
import { decodeTokenOrMainToken } from "../middlewares";
import {
  createServiceSales,
  getAllServiceSales,
  getServiceSale,
  updateServiceSale,
  deleteServiceSale,
} from "../controllers/serviceSaleController";

const router = express.Router();
router.use(decodeTokenOrMainToken);

router.get("/", getAllServiceSales);
router.get("/:id", getServiceSale);
router.post("/", createServiceSales);
router.put("/:id", updateServiceSale);
router.delete("/:id", deleteServiceSale);

export default router;

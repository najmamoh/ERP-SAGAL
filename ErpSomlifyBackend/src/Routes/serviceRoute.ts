import { Router } from "express";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController";
import { decodeToken } from "../middlewares";

const router = Router();

router.get("/", decodeToken, getAllServices);
router.post("/", decodeToken, createService);
router.put("/:id", decodeToken, updateService);
router.delete("/:id", decodeToken, deleteService);

export default router;

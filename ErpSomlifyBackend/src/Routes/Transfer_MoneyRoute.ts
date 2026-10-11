import { Router } from "express";
import {
  getAlltransferMoney,
  gettransfer_Money,
  createtransfer_Money,
  updatetransfer_Money,
  deletetransfer_Money,
} from "../controllers/Transfer_MoneyController";
import { decodeTokenOrMainToken, requirePermission } from "../middlewares";

const router = Router();

router.use(decodeTokenOrMainToken);

router.get("/", requirePermission('banking', 'read'), getAlltransferMoney);
router.get("/:id", requirePermission('banking', 'read'), gettransfer_Money);
router.post("/", requirePermission('banking', 'create'), createtransfer_Money);
router.put("/:id", requirePermission('banking', 'update'), updatetransfer_Money);
router.delete("/:id", requirePermission('banking', 'delete'), deletetransfer_Money);

export default router;

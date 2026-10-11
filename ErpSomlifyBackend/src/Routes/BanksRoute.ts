import { Router } from "express";
import { getAllBanks ,CreateBanks,DeleteBank,GetoneeBank} from "../controllers/BanksController";

const router = Router();

router.post("/", CreateBanks);

router.get("/", getAllBanks);

router.delete("/:id", DeleteBank);

router.get("/:id", GetoneeBank);

export default router;

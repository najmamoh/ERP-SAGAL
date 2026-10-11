import { Router } from "express";
import {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobsController";
import { decodeToken } from "../middlewares";

const router = Router();

router.get("/", decodeToken ,  getAllJobs);
router.get("/:id",decodeToken ,  getJob);
router.post("/",decodeToken, createJob);
router.put("/:id",decodeToken , updateJob);
router.delete("/:id",decodeToken, deleteJob);

export default router;

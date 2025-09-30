import express from "express";
import { verifyToken } from "../middleware/verifytoken.js";
import {
  deleteAllDatasets,
  getDataset,
} from "../controller/DatasetController.js";

const router = express.Router();

router.get("/", verifyToken, getDataset);
router.delete("/delete", verifyToken, deleteAllDatasets);
export default router;

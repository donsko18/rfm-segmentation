import express from "express";
import { verifyToken } from "../middleware/verifytoken.js";
import { getElbow, getModel } from "../controller/ModellingController.js";

const router = express.Router();

router.get("/", verifyToken, getElbow);
router.get("/:k", verifyToken, getModel)
export default router;

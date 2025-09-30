import express from "express";
import { verifyToken, verifyTokenDataset } from "../middleware/verifytoken.js";
import {
  getUser,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
} from "../controller/UserController.js";
import {
  loginUser,
  logoutUser,
  updateUserSelf,
} from "../controller/UserSelfController.js";

const router = express.Router();


router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.patch("/updateSelf", verifyToken, updateUserSelf);

// Semua route ini wajib token
router.get("/allUser", verifyToken, getUser);
// untuk isi dari ubah profile
router.get("/me", verifyToken, getUserById);
// Untuk manajemen pengguna
router.get("/:id", verifyToken, getUserById);
router.post("/", verifyToken, createUser);
router.delete("/:id", verifyToken, deleteUser);
router.patch("/update/:username", verifyToken, updateUser);


export default router;

// middleware/verifyToken.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Pake JWT
// export const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ msg: "Token tidak ditemukan" });
//   }

//   const token = authHeader.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ msg: "Format token salah" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // payload JWT
//     next();
//   } catch (err) {
//     return res
//       .status(403)
//       .json({ msg: "Token tidak valid atau sudah expired" });
//   }
// };


// No JWT
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "Token tidak ditemukan" });
    }

    // Format harus "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "Format token salah" });
    }

    // Cari user berdasarkan token yang tersimpan di DB
    const user = await prisma.users.findFirst({
      where: { token },
    });

    if (!user) {
      return res
        .status(403)
        .json({ msg: "Token tidak valid atau user tidak ditemukan" });
    }

    // Simpan info user di req untuk dipakai controller
    req.user = user;

    next(); // lanjut ke controller
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const verifyTokenDataset = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: "Token tidak ditemukan" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Format token salah" });

    const user = await prisma.users.findFirst({ where: { token } });
    if (!user) return res.status(403).json({ msg: "Token tidak valid" });

    req.user = user; // simpan user di request
    next();
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

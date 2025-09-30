import { PrismaClient } from "@prisma/client";
import { response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Pake JWT
// export const loginUser = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await prisma.users.findUnique({ where: { username } });

//     if (!user) {
//       return res.status(404).json({ msg: "Username tidak ditemukan" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ msg: "Password salah" });
//     }

//     const token = jwt.sign(
//       { username: user.username, name: user.name }, // payload
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" } // token berlaku 1 jam
//     );

//     res.status(200).json({
//       msg: "Login Berhasil",
//       token
//     });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// };

// No JWT

export const getUser = async (req, res) => {
  try {
    const response = await prisma.users.findMany({
      select: {
        username: true,
        name: true,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    let usernameTarget;

    if (req.params.id) {
      usernameTarget = req.params.id;
    } else {
      usernameTarget = req.user.username;
    }
    const response = await prisma.users.findUnique({
      where: {
        username: usernameTarget,
      },
      select: {
        username: true,
        name: true,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, name } = req.body;

    // cek apakah username sudah ada
    const existingUser = await prisma.users.findUnique({
      where: { username },
      select: { username: true },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "Username sudah dipakai" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user baru
    const newUser = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
    });

    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await prisma.users.delete({
      where: {
        username: id,
      },
    });

    res.status(200).json({
      msg: `User ${response.username} berhasil dihapus`,
    });
  } catch (error) {
    // kalau user tidak ada, Prisma kasih error P2025
    if (error.code === "P2025") {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }
    res.status(500).json({ msg: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username } = req.params;
    const { password, name } = req.body;

    const updateData = {};

    if (name) {
      updateData.name = name;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const updateUser = await prisma.users.update({
      where: { username },
      data: updateData,
      select: {
        username: true,
        name: true,
      },
    });
    res.status(200).json({
      msg: "User Berhasil Diperbaharui",
      user: updateUser,
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error: record tidak ditemukan
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }
    res.status(500).json({ msg: error.message });
  }
};

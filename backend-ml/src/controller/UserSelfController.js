import { PrismaClient } from "@prisma/client";
import { response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.users.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ msg: "Username tidak ditemukan" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Password salah" });
    }
    const token = crypto.randomBytes(32).toString("hex");

    await prisma.users.update({
      where: { username },
      data: { token },
    });
    res.status(200).json({
      msg: "Login Berhasil",
      token,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // `req.user` sudah berisi data user lengkap
    const { username } = req.user;

    // Kosongkan token user tersebut
    await prisma.users.update({
      where: { username },
      data: { token: "" },
    });

    res.status(200).json({
      msg: "Logout Berhasil",
      username, // opsional, kalau mau kasih info user
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateUserSelf = async (req, res) => {
  try {
    const { username } = req.user;
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
      msg: "Berhasil Memperbaharui Profil Anda!",
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

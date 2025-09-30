import fs from "fs";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "File tidak ditemukan" });
    }

    const filePath = req.file.path;

    // ✅ Hapus semua dataset lama sebelum proses upload baru
    await prisma.dataset.deleteMany();
    console.log("🗑️ Semua dataset lama dihapus");

    // Kirim path ke Flask
    const flaskRes = await axios.post("http://127.0.0.1:5000/rfm", {
      path: filePath,
    });

    // Hasil JSON dari Flask (sudah jadi array RFM)
    const cleanedData = flaskRes.data;

    // ✅ Simpan ke database dengan Prisma
    await prisma.dataset.createMany({
      data: cleanedData.map((row) => ({
        customer_id: row.Customer_ID,
        customer_name: row.Customer_Name,
        recency: row.Recency,
        frequency: row.Frequency,
        monetary: row.Monetary,
      })),
    });

    // ✅ Hapus file CSV setelah berhasil diproses
    try {
      fs.unlinkSync(filePath);
      console.log("🗑️ CSV sementara dihapus:", filePath);
    } catch (unlinkErr) {
      console.warn("⚠️ Gagal hapus CSV:", unlinkErr.message);
    }

    res.status(200).json({
      msg: "Dataset berhasil diproses & disimpan ke database",
      data: cleanedData,
    });
  } catch (error) {
    console.error("❌ ERROR DatasetController:", error.message);
    res.status(500).json({ msg: error.message });
  }
};


export const getDataset = async (req, res) => {
  try {
    const datasets = await prisma.dataset.findMany({
      orderBy: { id: "asc" }, // biar urut dari awal
    });

    res.status(200).json({
      msg: "Data berhasil diambil",
      data: datasets,
    });
  } catch (error) {
    console.error("❌ ERROR getDatasets:", error.message);
    res.status(500).json({ msg: error.message });
  }
};
export const deleteAllDatasets = async (req, res) => {
  try {
    await prisma.dataset.deleteMany(); // hapus semua baris
    res.status(200).json({ msg: "Semua dataset berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
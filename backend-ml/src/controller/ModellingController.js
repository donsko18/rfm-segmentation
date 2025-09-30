import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
export const getElbow = async (req, res) => {
  try {
    // 1️⃣ Cek dataset dulu
    const datasetCount = await prisma.dataset.count();
    if (datasetCount === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Dataset masih kosong, silakan upload terlebih dahulu.",
      });
    }

    // 2️⃣ Ambil parameter max_k (default 10)
    const max_k = req.query.max_k || 10;

    // 3️⃣ Panggil Flask API
    const flaskRes = await axios.get("http://127.0.0.1:5000/elbow", {
      params: {
        max_k,
        cols: "recency,frequency,monetary",
        scale: true,
      },
    });

    // 4️⃣ Balikkan hasil ke Vue
    return res.status(200).json({
      ok: true,
      msg: "Hasil elbow berhasil diambil",
      data: flaskRes.data.data, // ambil field "data" dari Flask
    });
  } catch (error) {
    console.error("❌ ERROR getElbow:", error.message);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

// ================== MODELLING ==================
export const getModel = async (req, res) => {
  try {
    // 1) Cek dataset ada
    const datasetCount = await prisma.dataset.count();
    if (datasetCount === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Dataset masih kosong, silakan upload terlebih dahulu.",
      });
    }

    // 2) Ambil k dari params (dari Vue route /modelling/:k)
    const k = req.params.k ? parseInt(req.params.k, 10) : 3;
    if (isNaN(k) || k < 1) {
      return res.status(400).json({
        ok: false,
        msg: "Parameter 'k' tidak valid. Harus angka >= 1.",
      });
    }

    // 3) Ambil data dari DB
    const rows = await prisma.dataset.findMany({
      select: {
        customer_name: true,
        recency: true,
        frequency: true,
        monetary: true,
      },
      take: 5000,
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Tidak ada baris data di tabel dataset.",
      });
    }

    // 4) Siapkan payload untuk Flask
    const payload = {
      k,
      // sertakan customer_name agar tidak dibuang
      cols: "recency,frequency,monetary,customer_name",
      scale: true,
      data: rows,
    };

    // 5) Panggil Flask API
    const flaskUrl = process.env.FLASK_URL || "http://127.0.0.1:5000/kmeans";
    const flaskRes = await axios.post(flaskUrl, payload, {
      timeout: 120000,
    });

    if (!flaskRes.data || !flaskRes.data.ok) {
      return res.status(500).json({
        ok: false,
        msg: "Flask gagal memproses KMeans",
        detail: flaskRes.data,
      });
    }

    // 6) Kirim hasil ke frontend
    return res.status(200).json({
      ok: true,
      msg: "Hasil KMeans berhasil diambil",
      data: flaskRes.data.data,
    });
  } catch (error) {
    console.error("❌ ERROR getModel:", error?.message || error);
    return res.status(500).json({
      ok: false,
      msg: error?.message || String(error),
    });
  }
};

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/datasets");
  },
  filename: (req, file, cb) => {
    // ambil ekstensi asli (misal .csv)
    const ext = path.extname(file.originalname);
    // kasih nama dengan timestamp + ekstensi
    cb(null, Date.now() + ext);
  },
});

export const upload = multer({ storage });

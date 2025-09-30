import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoute from "./src/routes/UserRoute.js";
import { uploadDataset } from "./src/controller/DatasetController.js";
import {
  verifyToken,
  verifyTokenDataset,
} from "./src/middleware/verifytoken.js";
import { upload } from "./src/middleware/multer.js";
import DatasetRoute from "./src/routes/DatasetRoute.js";
import ModellingRoute from "./src/routes/ModellingRoute.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use("/users", userRoute);

app.post("/upload", verifyTokenDataset, upload.single("file"), uploadDataset);
app.use("/dataset", DatasetRoute);

app.use("/modelling", verifyToken, ModellingRoute);
app.listen(process.env.APP_PORT, () => {
  console.log("Server running");
});

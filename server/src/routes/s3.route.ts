import { Router } from "express";
import {
  deleteFileUrl,
  getFileUrl,
  getUploadUrl,
} from "../controllers/s3.controller";
import { verifyToken } from "../middlewares/authMiddleware";
const s3FilesRouter = Router();

s3FilesRouter.get("/file-url", getFileUrl);

s3FilesRouter.post("/upload-url", verifyToken, getUploadUrl);

s3FilesRouter.delete("/delete", verifyToken, deleteFileUrl);

export default s3FilesRouter;

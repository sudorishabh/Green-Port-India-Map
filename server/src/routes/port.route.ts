import { Router } from "express";
import {
  getPorts,
  getPort,
  updatePort,
  createPort,
  deletePort,
} from "../controllers/port.controller";
import { verifyToken } from "../middlewares/authMiddleware";
const router = Router();

router.get("/all-ports", getPorts);
router.get("/single-port/:id", getPort);
router.post("/update-port/:id", verifyToken, updatePort);
router.post("/create-port", verifyToken, createPort);
router.delete("/delete-port/:id", verifyToken, deletePort);

export default router;

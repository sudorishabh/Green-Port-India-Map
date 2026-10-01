import { Router } from "express";
import {
  allKpis,
  createKpi,
  getKpi,
  getKpiInitiatives,
  updateKpi,
  addInitiativeToKpi,
  getInitiatives,
  deleteKpi,
  updateInitiative,
  deleteGreenInitiative,
} from "../controllers/kpi.controller";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/all-kpis", allKpis);
router.get("/initiatives", getKpiInitiatives);
router.get("/single-kpi/:id", getKpi);
router.post("/create-kpi", verifyToken, createKpi);
router.post("/update-kpi/:id", verifyToken, updateKpi);

router.delete("/delete-kpi/:id", verifyToken, deleteKpi);
// router.post("/links/:id", addLinkToKpi);
router.get("/port-initiatives/:port_id", getInitiatives);
router.post("/initiatives/:id/:port_id", verifyToken, addInitiativeToKpi);
// router.put("/:link_id", updateKpiLink);
// router.delete("/:link_id", deleteKpiLink);

router.post("/update-initiative/:initiative_id", verifyToken, updateInitiative);
router.delete(
  "/delete-initiative/:initiative_id",
  verifyToken,
  deleteGreenInitiative
);
export default router;

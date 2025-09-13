import { Router } from "express";
import auth from "../middleware/auth.js";
import { createCtrl, nextCtrl, getAllCtrl, getByIdCtrl, getStatsCtrl, getMonthlyCtrl, getYearlyCtrl } from "../controllers/saleController.js";

const r = Router();
r.use(auth);
r.get("/next", nextCtrl);
r.post("/", createCtrl);
r.get("/", getAllCtrl);
r.get("/stats", getStatsCtrl);
r.get("/monthly", getMonthlyCtrl);
r.get("/yearly", getYearlyCtrl);
r.get("/:id", getByIdCtrl);
export default r;

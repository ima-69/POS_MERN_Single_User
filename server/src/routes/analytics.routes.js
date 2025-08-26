import { Router } from "express";
import auth from "../middleware/auth.js";
import { dashboardCtrl } from "../controllers/analyticsController.js";

const r = Router();
r.use(auth);
r.get("/dashboard", dashboardCtrl);
export default r;

import { Router } from "express";
import auth from "../middleware/auth.js";
import { createCtrl, nextCtrl } from "../controllers/saleController.js";

const r = Router();
r.use(auth);
r.get("/next", nextCtrl);
r.post("/", createCtrl);
export default r;

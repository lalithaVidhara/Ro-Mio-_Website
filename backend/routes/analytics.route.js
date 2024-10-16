import express from "express";
import { adminRoute, protectRoute } from "../middleware/product.middleware.js";

const router = express.Router();    

router.get("/",protectRoute, adminRoute, getAnalytics);

export default router
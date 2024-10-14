import express from "express";
import { getAllProducts } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/product.middleware.js";


const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);

export default router;
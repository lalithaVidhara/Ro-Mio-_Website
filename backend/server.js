import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";

import { connectDB } from "./lib/db.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // parse body of requests as JSON
app.use(cookieParser());

//authentication
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);


app.listen(PORT, () => {
    console.log("server is running on port " + PORT);

    connectDB();
}); 



import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";


export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}); //get every product
        res.json({products});
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featuredProducts");
        if(featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }  
        
        //if not in redis fetch from mongodb
        featuredProducts = await Product.find({isFeatured:true}).lean(); // .lean return plain javascript object insted mongodb doc

        if(!featuredProducts) {
            return res.status(404).json({message: "No featured products found"});
        } 

        //store in redis for quick access

        await redis.set("featuredProducts", JSON.stringify(featuredProducts));
        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
};

export const createProduct = async (req, res) => {
    try {
        const {name, description, price, category, image} = req.body;

        let cloudinatyResponse = null;
        if(image) {
            cloudinatyResponse = await cloudinary.uploader.upload(image,{folder:"products"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinatyResponse?.secure_url ? cloudinatyResponse.secure_url : "",
            category,
        })

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}
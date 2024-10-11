import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    })

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    })

    return { accessToken, refreshToken };
}

const storeRefreshToken = async (refreshToken, userId) => {
    await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 7*24*60*60); //7days
} 

const setCookies = (res, accessToken, refreshToken) => {
   res.cookie("accessToken", accessToken, {
       httpOnly: true, //Prevent XSS attacks
       secure:process.env.NODE_ENV === "production", //Only send cookie over HTTPS
       sameSite: "strict", //Prevent CSRF attacks
       maxAge: 15 * 60 * 1000, //15 minutes
   }); 
   res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //Prevent XSS attacks
    secure:process.env.NODE_ENV === "production", //Only send cookie over HTTPS
    sameSite: "strict", //Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
   }); 
};

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }    
        const user = await User.create({ name, email, password });

        //authentication
        const {accessToken, refreshToken} = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: error.message });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if(user && (await user.comparePassword(password))) {
            const {accessToken, refreshToken} = generateTokens(user._id);

            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        }
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const result = await redis.del(`refreshToken:${refreshToken}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }
};
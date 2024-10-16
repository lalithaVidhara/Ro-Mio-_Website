import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();
        res.json(analyticsData);
    } catch (error) {
        
    }
};

export const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    //to do
    //const salesData = 
}
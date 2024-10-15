import {stripe} from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import dotenv from "dotenv";

dotenv.config();


export const createCheckoutSession = async (req, res) => {
    try {
        const {products, couponCode} = req.body;

        if(!Array.isArray(products) || products.length === 0) {
            console.log("Invalid or empty product array");
            return res.status(400).json({error: "Invalid or empty product array"});
        }

        let totalAmount = 0;

        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100); //stripe takes amount in cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        image: [product.image],
                    },
                    unit_amount: amount,
                }
            }
        });

        let coupon = null;

        if(couponCode) {
            coupon = await Coupon.findOne({code: couponCode, userId: req.user._id, isActive: true});
            if(coupon) {
                totalAmount = Math.round(totalAmount * (100 - coupon.discountPercentage) / 100);
            }    
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types : ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url:`${process.env.CLIENT_URL}/purchase-success?sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon 
            ?[
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                }
             ] 
            : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
            }
        });

    } catch (error) {
        
    }
}


async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
}
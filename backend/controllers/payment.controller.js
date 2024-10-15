import {stripe} from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
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
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
						quantity: p.quantity,
						price: p.price,
                    }))),
            },
        });

        //creating new coupons for next purchase if 200$ or more is spend
        if(totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }

        res.status(200).json({id: session.id, totalAmount: totalAmount/100});
    } catch (error) {
        console.log("Error in createCheckoutSession controller", error.message);
        res.status(500).json({message: "Server Error Processing Checkout", error: error.message});
    }
};


async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
};

async function createNewCoupon(userId) {
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate : new Date(Date.noow() + 30 * 24 * 60 * 60 * 1000), //30Days
        userId: userId,
    });

    await newCoupon.save();
    return newCoupon;
}

export const checkoutSuccess = async (req, res) => {
    try {
        const {sessionId} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if(session.payment_status === "paid") {
            if(session.metadata.couponCode) {
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode,
                    userId: session.metadata.userId,
                }, {
                    isActive: false
                });
            }
            //create a new order
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
                totalAmount: session.amount_total / 100, //Convert from cents to $
                stripeSessionId: sessionId,
            })

            await newOrder.save();

            res.status(200).json({
                success: true,
                message: "Order created successfully and coupon applied if any",
                orderId: newOrder._id,
            });
        }
    } catch (error) {
        console.log("Error in checkoutSuccess controller", error.message);
        res.status(500).json({message: "Server Error Processing Successfull Checkout", error: error.message});
    }
}
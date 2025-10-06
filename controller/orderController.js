import { request, response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe"
import User from "../models/User.js"


//place order COD:/api/order/cod

export const placeOrderCOD=async(req ,res)=>{
    try{
        const {userId,items,address}=req.body;
        if(!address||items.length===0){
            return res.json({
                success:false,
                message:"invalid data"
            })
        }

        //calculate amount using items
let amount=await items.reduce(async(acc ,item)=>{
    const product=await Product.findById(item.product);
    return (await acc)+product.offerPrice*item.quantity;
},0)
//add tax charge(%2)
amount+=Math.floor(amount*0.02)
await Order.create({
    userId,
    items,
    amount,
    address,
    paymentType:'COD'
});
return res.json({
    success:true,
    message:"Order Placed successfully"
})
    }catch(error){
        return res.json({
            success:false,
            message:error.message
        });
    }
}
//order using stripe payment
export const placeOrderStripe=async(req ,res)=>{
    try{
        const {userId,items,address}=req.body;
        const {origin}=req.headers;
        if(!address||items.length===0){
            return res.json({
                success:false,
                message:"invalid data"
            })
        }
        let productData=[];

        //calculate amount using items
let amount=await items.reduce(async(acc ,item)=>{
    const product=await Product.findById(item.product);
    product.push({
        name:product.name,
        price:product.offerPrice,
        quantity:item.quantity
    })
    return (await acc)+product.offerPrice*item.quantity;
},0)
//add tax charge(%2)
amount+=Math.floor(amount*0.02)
const order=await Order.create({
    userId,
    items,
    amount,
    address,
    paymentType:'Online'
});
//stripe gateway initialize

const  stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY);
//CREATE LINE_ITEM FOR STRIPE

const line_items=productData.map((item)=>{
    return{
        price_data:{
            currency:"usd",
            productData:{
                name:item.name,
            },
            unit_amount:Math.floor(item.price+item.price*0.02)*100
        },
        quantity:item.quantity,
    }
})
const sessions=await stripeInstance.checkout.sessions.create({
    line_items,
    mode:'payment',
    success_url:`${origin}/loader?next=my-orders`,
        cancel_url:`${origin}/cart`,
        metadata:{
            orderId:order._id.toString(),
            userId,
        }
})
return res.json({
    success:true,
    message:"Order Placed successfully"
})
    }catch(error){
        return res.json({
            success:false,
            message:error.message
        });
    }
}
//STRIPE WEBHOOKS TO VERIFY PAYMENT ACTION
export const stripeWebhooks=async(req ,res)=>{
    const  stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY);
    const sig=req.headers["stripe-signature"];
    let event;
    try{
        event=stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }catch(error){
        response.status(400).send(`webhook error:${error.message}`)
    }
    //handle the event
    switch(event.type){
        case "payment_intent.succeeded":{
            const paymentIntent=event.data.object;
            const paymentIntentId=paymentIntent.id;

            const session=await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId
            });
            const {orderId,userId}=session.data[0].metadata;
            //mark payment as paid
            await Order.findByIdAndUpdate(orderId,{isPaid:true})

            //clear user cart 
            await User.findByIdAndUpdate(userId,{cartItems:{}});
            break;
        }
                case "payment_intent.failed":{
                    const paymentIntent=event.data.object;
            const paymentIntentId=paymentIntent.id;

            const session=await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId
            });
            const {orderId}=session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break
                }
                default:
                     console.error(`unhandled error type {event.type}`)
                     
                     break;
    }
    response.json({received:true})
}
//order detail of individuals user i.e by userId:/api/order/user

export const getUserOrders=async(req ,res)=>{
    try{

        const {userId}=req.body;

        const orders=await
         Order.find({
            userId,
            $or:[{paymentType:"COD"},{isPaid:true}]
         }).populate("items.product address").sort({createdAt:-1});
         res.json({
            success:true,
           orders
         })
    }catch(error){
        return res.json({
            success:false,
            message:error.message
        });
    }
}

//All orders for seller/admin:/api/order/seller

export const getAllOrders=async(req ,res)=>{
    try{
        const orders=await
         Order.find({
           
            $or:[{paymentType:"COD"},{isPaid:true}]
         }).populate("items.product address").sort({createdAt:-1});
         res.json({
            success:true,
          orders
         })
    }catch(error){
        return res.json({
            success:false,
            message:error.message
        });
    }
}

import cookieParser from 'cookie-parser';
import express, { application, json } from 'express';
import cors from "cors";
import connectDB from './configs/db.js';
import 'dotenv/config'
import userRouter from './routes/userRoutes.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/claudinary.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import addAddressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controller/orderController.js';




const app = express();
const port = process.env.PORT || 4000;

await connectDB()
await connectCloudinary()

//allow multiple origin
const allowedorigins = ["http://localhost:5174"];

addAddressRouter.post('/stripe',express.raw({type:application/json}),stripeWebhooks)

addAddressRouter.post('/stripe', express.raw({ type: application / json }), stripeWebhooks)


//middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedorigins, credentials: true }));

app.get('/', (req, res) => res.send("Api working"));
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addAddressRouter)
app.use('/api/order', orderRouter)


app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})

import express from "express";
import cookieParser from "cookie-parser"
import errorHandler from "./middlewares/errorHandler.middleware.js"
import cors from "cors"
const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true  
}));

// niche hum configure kiya hai ki express sirf json ka data limit 16kb hai 
app.use(express.json({limit:"16kb"}));

app.use(express.urlencoded({extended: true, limit: "16kb"}))

// ye hum koi file ko locally apne server pe store karte waqt use karenge 
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js"
import productRouter from "./routes/product.route.js"

app.use("/beverage/api/v1/auth", authRouter) // Dedicated authentication routes
app.use("/beverage/api/v1/users", userRouter) // General user routes (including customers)
app.use("/beverage/api/v1/products", productRouter)
app.use("/beverage/api/v1/orders", orderRouter)
app.use("/beverage/api/v1/hubs", hubRouter)
app.use("/beverage/api/v1/hub-inventory", hubInventoryRouter)
app.use("/beverage/api/v1/inventory-logs", inventoryLogRouter)
app.use("/beverage/api/v1/delivery-partners", deliveryPartnerRouter)

app.use(errorHandler)
export default app
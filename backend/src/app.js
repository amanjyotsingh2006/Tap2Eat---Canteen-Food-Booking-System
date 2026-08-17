import express from "express"

import cors from "cors"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.routes.js"
import userRoute from "./routes/user.routes.js"
import categoryRoute from "./routes/category.routes.js"
import foodRoutes from "./routes/food.routes.js"
import favouriteRoutes from "./routes/favourites.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import orderRoutes from "./routes/order.routes.js"
import reviewRoutes from "./routes/reviews.routes.js"
import NotificationRoutes from "./routes/notification.routes.js"
import paymentRoutes from "./routes/payments.routes.js"
import adminDashboardRoute from "./routes/adminDashboard.routes.js"

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cookieParser())

app.use("/api/v1/users", authRoutes)
app.use("/api/v1/profile", userRoute)
app.use("/api/v1/categories", categoryRoute)
app.use("/api/v1/foods", foodRoutes)
app.use("/api/v1/favourites", favouriteRoutes)
app.use("/api/v1/cart", cartRoutes)
app.use("/api/v1/orders", orderRoutes)
app.use("/api/v1/reviews", reviewRoutes)
app.use("/api/v1/notification", NotificationRoutes)
app.use("/api/v1/payments", paymentRoutes)
app.use("/api/v1/adminDashboard", adminDashboardRoute)

export default app
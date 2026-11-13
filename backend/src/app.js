import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import categoryRoute from "./routes/category.routes.js";
import foodRoutes from "./routes/food.routes.js";
import favouriteRoutes from "./routes/favourites.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import NotificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import adminDashboardRoute from "./routes/adminDashboard.routes.js";

import ApiError from "./utils/ApiError.js";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", authRoutes);
app.use("/api/v1/profile", userRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/favourites", favouriteRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/notification", NotificationRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/adminDashboard", adminDashboardRoute);

// Unknown route
app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Global error handler — keep this after all routes
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    if (err.code === 11000) {
        statusCode = 409;
        message = "A record with this value already exists";
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Invalid or expired authentication token";
    }

    if (statusCode >= 500) {
        console.error(err);
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    });
});

export default app; 
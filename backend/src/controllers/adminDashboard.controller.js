import { Category } from "../models/category.model.js";
import { Food } from "../models/food.model.js";
import { Order } from "../models/order.model.js";
import { Payment } from "../models/payments.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
    const totalUser = await User.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalFoods = await Food.countDocuments()
    const totalCategories = await Category.countDocuments()
    const totalRevenue = await Payment.aggregate([
        {
            $match: {
                paymentStatus: "Success"
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        }
    ])

    const revenue = totalRevenue[0]?.total || 0

    const totalPendingOrders = await Order.countDocuments({
        status: "Pending"
    })

    const totalCompletedOrders = await Order.countDocuments({
        status: "Completed"
    })

    const totalCancelledOrders = await Order.countDocuments({
        status: "Cancelled"
    })

    const totalPreparingOrders = await Order.countDocuments({
        status: "Preparing"
    })

    const totalReadyOrders = await Order.countDocuments({
        status: "Ready"
    })

    const dashboard = {
        totalUser,
        totalOrders,
        totalFoods,
        totalCategories,
        revenue,
        totalPendingOrders,
        totalCompletedOrders,
        totalCancelledOrders,
        totalPreparingOrders,
        totalReadyOrders
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            dashboard,
            "Dashboard Fetched Successfully"
        )
    )
})


export const getRevenue = asyncHandler(async (req, res) => {
    const totalRevenue = await Payment.aggregate([
        {
            $match: {
                paymentStatus: "Success"
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        }
    ])

    const revenue = totalRevenue[0]?.total || 0

    return res.status(200).json(
        new ApiResponse(
            200,
            revenue,
            "Revenue fetched Successfully"
        )
    )
})


export const getRecentOrders = asyncHandler(async (req, res) => {
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10)

    return res.status(200).json(
        new ApiResponse(
            200,
            recentOrders,
            "Recent Orders fetched Successfully"
        )
    )
})


export const getTopFoods = asyncHandler(async (req, res) => {
    const topFoods = await Order.aggregate([
        {
            $match: {
                status: "Completed"
            }
        },
        {
            $unwind: "$items"
        },
        {
            $group: {
                _id: "$items.food",
                totalQuantity: {
                    $sum: "$items.quantity"
                }
            }
        },
        {
            $sort: {
                totalQuantity: -1
            }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "foods",
                localField: "_id",
                foreignField: "_id",
                as: "food"
            }
        },
        {
            $unwind: "$food"
        },
        {
            $project: {
                _id: 0,
                foodId: "$food._id",
                name: "$food.name",
                image: "$food.image",
                totalQuantity: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            topFoods,
            "Top Food fetched Successfully"
        )
    )
})


export const getTopCustomers = asyncHandler(async (req, res) => {
    const topCustomers = await Order.aggregate([
        {
            $match: {
                status: "Completed"
            }
        },
        {
            $group: {
                _id: "$user",
                totalOrders: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                totalOrders: -1
            }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                _id: 0,
                userId: "$user._id",
                fullName: "$user.name",
                email: "$user.email",
                totalOrders: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            topCustomers,
            "Top Customers fetched Successfully"
        )
    )
})
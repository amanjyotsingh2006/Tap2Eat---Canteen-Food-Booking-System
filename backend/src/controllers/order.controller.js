import mongoose from "mongoose";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import { Cart } from "../models/cart.model.js";
import { Food } from "../models/food.model.js";
import { Order } from "../models/order.model.js";

export const placeOrder = asyncHandler(async (req, res) => {
    const { deliveryAddress } = req.body;

    if (
        typeof deliveryAddress !== "string" ||
        !deliveryAddress.trim()
    ) {
        throw new ApiError(400, "Delivery address is required");
    }

    const session = await mongoose.startSession();

    let createdOrder;

    try {
        await session.withTransaction(async () => {
            const cart = await Cart.findOne({
                user: req.user._id
            }).session(session);

            if (!cart || !cart.items.length) {
                throw new ApiError(400, "Cart is empty");
            }

            const foodIds = cart.items.map(item => item.food);

            const foods = await Food.find({
                _id: { $in: foodIds }
            }).session(session);

            const foodMap = new Map(
                foods.map(food => [food._id.toString(), food])
            );

            let totalAmount = 0;

            const orderItems = cart.items.map(item => {
                const food = foodMap.get(item.food.toString());

                if (!food) {
                    throw new ApiError(
                        404,
                        "One or more food items in your cart no longer exist"
                    );
                }

                if (food.available !== "Yes") {
                    throw new ApiError(
                        400,
                        `${food.name} is currently unavailable`
                    );
                }

                if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                    throw new ApiError(400, "Invalid cart quantity");
                }

                const currentPrice = food.price;

                totalAmount += currentPrice * item.quantity;

                return {
                    food: food._id,
                    quantity: item.quantity,
                    price: currentPrice
                };
            });

            const orderNumber =
                `ORD-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

            const [order] = await Order.create([{
                user: req.user._id,
                items: orderItems,
                totalAmount,
                deliveryAddress: deliveryAddress.trim(),
                orderNumber,
                status: "Pending",
                paymentStatus: "Pending"
            }], { session });

            cart.items = [];
            cart.totalPrice = 0;

            await cart.save({ session });

            createdOrder = order;
        });
    } finally {
        await session.endSession();
    }

    return res.status(201).json(
        new ApiResponse(201, createdOrder, "Order placed successfully")
    );
});

export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate("items.food")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, "Orders fetched successfully")
    );
});

export const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Order ID");
    }

    const order = await Order.findById(id).populate("items.food");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    return res.status(200).json(
        new ApiResponse(200, order, "Order fetched successfully")
    );
});

export const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Order ID");
    }

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    if (["Preparing", "Ready", "Completed"].includes(order.status)) {
        throw new ApiError(
            400,
            "This order can no longer be cancelled. Contact the canteen."
        );
    }

    if (order.status === "Cancelled") {
        throw new ApiError(400, "Order is already cancelled");
    }

    if (order.paymentStatus === "Success") {
        throw new ApiError(
            400,
            "Payment has already been collected. Contact the admin for cancellation and refund."
        );
    }

    order.status = "Cancelled";

    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled successfully")
    );
});

export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("user", "fullName email phone")
        .populate("items.food")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, "All orders fetched successfully")
    );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Order ID");
    }

    const validStatus = [
        "Pending",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled"
    ];

    if (!validStatus.includes(status)) {
        throw new ApiError(400, "Invalid Order Status");
    }

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status === "Cancelled") {
        throw new ApiError(400, "Cancelled orders cannot be updated");
    }

    if (order.status === "Completed" && status !== "Completed") {
        throw new ApiError(400, "Completed orders cannot be changed");
    }

    if (status === "Cancelled" && order.paymentStatus === "Success") {
        throw new ApiError(
            400,
            "Collected payments must be refunded before cancelling this order"
        );
    }

    order.status = status;

    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order status updated successfully")
    );
});
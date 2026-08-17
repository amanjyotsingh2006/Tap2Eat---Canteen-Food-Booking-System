import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import { Cart } from "../models/cart.model.js"
import { Order } from "../models/order.model.js";
import mongoose from "mongoose";

export const placeOrder = asyncHandler(async (req, res) => {
    const { deliveryAddress } = req.body

    if (!deliveryAddress) {
        throw new ApiError(400, "Delivery Address is required")
    }

    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    if (cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty")
    }

    const orderNumber = `ORD-${Date.now()}`

    const order = await Order.create({
        user: req.user._id,
        items: cart.items,
        totalAmount: cart.totalPrice,
        deliveryAddress: deliveryAddress.trim(),
        orderNumber
    })

    cart.items = []
    cart.totalAmount = 0

    await cart.save()

    return res.status(201).json(
        new ApiResponse(
            201,
            order,
            "Order placed Successfully"
        )
    )
})

export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate("items.food").sort({ createdAt: -1 })

    if (orders.length === 0) {
        throw new ApiError(404, "No orders found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            orders,
            "Order fetched Successfully"
        )
    )
})

export const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid OrderId")
    }

    const order = await Order.findById(id).populate("items.food")

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            order,
            "Order fetched by ID Successfully"
        )
    )
})

export const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Order ID")
    }

    const order = await Order.findById(id)

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    if (order.status === "Completed") {
        throw new ApiError(400, "Completed orders cannot be cancelled")
    }

    if (order.status === "Cancelled") {
        throw new ApiError(400, "Order already cancelled")
    }

    order.status = "Cancelled"

    await order.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            order,
            "Order Cancelled Successfully"
        )
    )
})

export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate("user", "fullName email").populate("items.food").sort({ createdAt: -1 })

    if (!orders) {
        throw new ApiError(404, "Order not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            orders,
            "All orders fetched for Admin Successfully"
        )
    )
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Order Id")
    }

    if (!status) {
        throw new ApiError(400, "Status is required")
    }

    const validStatus = [
        "Pending",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled"
    ]

    if (!validStatus.includes(status)) {
        throw new ApiError(400, "Invalid Order Status")
    }

    const order = await Order.findById(id)

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    order.status = status

    await order.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            order,
            "Order status updated Successfully"
        )
    )
})
import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Payment } from "../models/payments.model.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Invalid Order ID")
    }

    const order = await Order.findById(orderId)

    if (!order) {
        throw new ApiError(404, "No order found")
    }

    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access")
    }

    if (order.orderStatus === "Cancelled") {
        throw new ApiError(
            400,
            "Cannot create payment for a cancelled order"
        )
    }

    const existingPayment = await Payment.findOne({ order: orderId })

    if (existingPayment) {
        throw new ApiError(400, "Payment already exist for this order")
    }

    const transactionId = `TXN-${Date.now()}`;

    const payment = await Payment.create({
        user: req.user._id,
        orderId: orderId,
        amount: order.totalAmount,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        transactionId: transactionId
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            payment,
            "Payment created Successfully"
        )
    )
})

export const verifyPayment = asyncHandler(async (req, res) => {
    const { orderId, transactionId } = req.body;

    if (!orderId || !transactionId) {
        throw new ApiError(400, "All fields are required")
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Invalid Order Id")
    }

    const payment = await Payment.findOne({ order: orderId })

    if (!payment) {
        throw new ApiError(404, "No Payment found")
    }

    if (payment.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access")
    }


    const order = await Order.findById(orderId)

    if(!order) {
        throw new ApiError(404, "No order found")
    }

    payment.transactionId = transactionId
    payment.paymentStatus = "Success";

    order.paymentStatus = "Success";

    await payment.save()
    await order.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            payment,
            "Payment Verified Successfully"
        )
    )
})

export const getPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Invalid Order ID")
    }
    const payment = await Payment.findOne({ order: orderId })

    if (!payment) {
        throw new ApiError(404, "No payment found")
    }

    if (payment.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            payment,
            "Payment fetched by Id Successfully"
        )
    )
})

export const refundPayment = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Payment Id")
    }

    const payment = await Payment.findById(id)

    if (!payment) {
        throw ApiError(404, "No payment found")
    }

    if (payment.paymentStatus != "Success") {
        throw new ApiError(400, "Only successful payments can be refunded")
    }

    payment.paymentStatus = "Refunded"

    await payment.save()

    const order = await Order.findById(payment.order)

    order.status = "Cancelled"
    order.paymentStatus = "Refunded"

    await order.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            payment,
            "Payment Refunded Successfully"
        )
    )
})
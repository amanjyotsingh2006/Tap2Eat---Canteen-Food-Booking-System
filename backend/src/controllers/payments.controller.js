import mongoose from "mongoose";

import { Order } from "../models/order.model.js";
import { Payment } from "../models/payments.model.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Invalid Order ID");
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    if (order.status === "Cancelled") {
        throw new ApiError(400, "Cannot pay for a cancelled order");
    }

    if (order.paymentStatus !== "Pending") {
        throw new ApiError(400, "Order payment is not pending");
    }

    const existingPayment = await Payment.findOne({ order: orderId });

    if (existingPayment) {
        throw new ApiError(409, "Payment already exists for this order");
    }

    const payment = await Payment.create({
        user: req.user._id,
        order: orderId,
        amount: order.totalAmount,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        transactionId: null
    });

    return res.status(201).json(
        new ApiResponse(201, payment, "COD payment created successfully")
    );
});

// COD does not use online payment verification.
export const verifyPayment = asyncHandler(async (req, res) => {
    throw new ApiError(
        400,
        "Online payment verification is not configured. COD payments are collected by the admin."
    );
});

export const collectPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Payment ID");
    }

    const session = await mongoose.startSession();
    let updatedPayment;

    try {
        await session.withTransaction(async () => {
            const payment = await Payment.findById(id).session(session);

            if (!payment) {
                throw new ApiError(404, "Payment not found");
            }

            if (payment.paymentMethod !== "COD") {
                throw new ApiError(400, "This endpoint is only for COD payments");
            }

            if (payment.paymentStatus !== "Pending") {
                throw new ApiError(400, "Payment is not pending");
            }

            const order = await Order.findById(payment.order).session(session);

            if (!order) {
                throw new ApiError(404, "Order not found");
            }

            if (order.status === "Cancelled") {
                throw new ApiError(400, "Cannot collect payment for a cancelled order");
            }

            payment.paymentStatus = "Success";
            order.paymentStatus = "Success";

            await payment.save({ session });
            await order.save({ session });

            updatedPayment = payment;
        });
    } finally {
        await session.endSession();
    }

    return res.status(200).json(
        new ApiResponse(200, updatedPayment, "COD payment collected successfully")
    );
});

export const getPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Invalid Order ID");
    }

    const payment = await Payment.findOne({
        order: orderId,
        user: req.user._id
    });

    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, payment, "Payment fetched successfully")
    );
});

export const refundPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Payment ID");
    }

    const session = await mongoose.startSession();
    let updatedPayment;

    try {
        await session.withTransaction(async () => {
            const payment = await Payment.findById(id).session(session);

            if (!payment) {
                throw new ApiError(404, "Payment not found");
            }

            if (payment.paymentStatus !== "Success") {
                throw new ApiError(400, "Only successful payments can be refunded");
            }

            const order = await Order.findById(payment.order).session(session);

            if (!order) {
                throw new ApiError(404, "Order not found");
            }

            payment.paymentStatus = "Refunded";
            order.paymentStatus = "Refunded";

            await payment.save({ session });
            await order.save({ session });

            updatedPayment = payment;
        });
    } finally {
        await session.endSession();
    }

    return res.status(200).json(
        new ApiResponse(200, updatedPayment, "Payment marked as refunded successfully")
    );
});
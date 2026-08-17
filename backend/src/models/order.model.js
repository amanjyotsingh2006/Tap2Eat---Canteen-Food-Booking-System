import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
}, {_id: false})

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: [
            "Pending",
            "Preparing",
            "Ready",
            "Completed",
            "Cancelled"
        ],
        default: "Pending"
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true})

export const Order = mongoose.model("Order", orderSchema)
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item"
            }
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
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

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Success",
                "Failed",
                "Refunded"
            ],
            default: "Pending"
        },

        orderNumber: {
            type: String,
            required: true,
            unique: true
        }
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
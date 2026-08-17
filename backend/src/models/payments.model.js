import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: [
            "COD",
            "UPI",
            "Card",
            "NET_BANKING", 
            "WALLET"
        ],
        required: true
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
    transactionId: {
        type: String,
        default: null
    }
}, {timestamps: true})

export const Payment = mongoose.model("Payment", paymentSchema)
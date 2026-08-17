import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: [
            "Orders",
            "Payments",
            "System",
            "Offer"
        ],
        default: "System"
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

export const Notification = mongoose.model("Notification", notificationSchema)
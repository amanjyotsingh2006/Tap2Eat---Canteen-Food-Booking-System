import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    confirmPassword: {
        type: String,
        reuqired: true
    },

    phone: {
        type: String,
        required: true,
        length: 10
    },

    profilePic: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    
    googleId: {
        type: String
    }
})

export const User = mongoose.model("User", userSchema)
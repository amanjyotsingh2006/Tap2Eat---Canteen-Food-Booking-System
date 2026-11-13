import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
            minlength: 6
        },

        phone: {
            type: String,
            match: [/^\d{10}$/, "Phone must be exactly 10 digits"],
            default: undefined
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
            type: String,
            sparse: true
        },

        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
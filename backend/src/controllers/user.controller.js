import bcrypt from "bcrypt";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const profile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile fetched successfully")
    );
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, phone } = req.body;

    if (fullName === undefined && phone === undefined) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (fullName !== undefined) {
        if (typeof fullName !== "string" || !fullName.trim()) {
            throw new ApiError(400, "Valid full name is required");
        }

        user.fullName = fullName.trim();
    }

    if (phone !== undefined) {
        if (typeof phone !== "string" || !/^\d{10}$/.test(phone)) {
            throw new ApiError(400, "Phone must be exactly 10 digits");
        }

        user.phone = phone;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
        .select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully")
    );
});

export const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    if (newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.password) {
        throw new ApiError(400, "Google account does not have a password");
    }

    const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});
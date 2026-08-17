import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

import { User } from "../models/user.model.js"

export const profile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")

    if(!user) {
        throw new ApiError(400, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Profile fetched successfully"
        )
    )
})

export const updateProfile = asyncHandler(async (req, res) => {
    const {fullName, phone} = req.body

    if(!fullName && !phone) {
        throw new ApiError(400, "Please provide atleast one field to update")
    }

    const user = await User.findById(user._id)
    if(!user) {
        throw new ApiError(400, "User not found")
    }

    if(fullName) user.fullName = fullName
    if(phone) user.phone = phone

    await user.save()

    const updatedUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "User Updated Successfully"
        )
    )
})

export const updatePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findById(user._id)

    if(!user) {
        throw new ApiError(400, "User not found")
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect")
    }

    user.password = bcrypt.hash(newPassword, 10)

    await user.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            "Password Changed Successfully"
        )
    )
})
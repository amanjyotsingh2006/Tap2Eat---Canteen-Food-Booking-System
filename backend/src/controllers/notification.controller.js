import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createNotification = asyncHandler(async(req, res) => {
    const {title, message, type="System"} = req.body

    if(!title || !message) {
        throw new ApiError(400, "All fields are required")
    }

    const notification = await Notification.create({
        user: req.user._id,
        title: title.trim(),
        message: message.trim(),
        type
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            notification,
            "Notification created Successfully"
        )
    )
})

export const getNotification = asyncHandler(async(req, res) => {
    const notification = await Notification.find({user: req.user._id}).sort({createdAt: -1})

    if(!notification) {
        throw new ApiError(404, "No notification found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            notification,
            "Notification fetched Successfully"
        )
    )
})

export const markNotificationAsRead = asyncHandler(async(req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Notification ID")
    }

    const notification = await Notification.findById(id)

    if(!notification) {
        throw new ApiError(404, "No notification found")
    }

    if (notification.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    if(notification.isRead===true) {
        throw new ApiError(400, "Notification is already marked as read")
    }

    notification.isRead = true

    await notification.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            notification,
            "Notification marked as read Successfully"
        )
    )
})

export const deleteNotification = asyncHandler(async(req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Notification ID")
    }

    const notification = await Notification.findById(id)

    if(!notification) {
        throw new ApiError(404, "No notification found")
    }

    if(notification.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access")
    }

    await notification.deleteOne()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Notification deleted Successfully"
        )
    )
})
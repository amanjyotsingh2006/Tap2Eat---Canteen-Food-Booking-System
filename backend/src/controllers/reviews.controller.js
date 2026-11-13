import mongoose from "mongoose";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import { Food } from "../models/food.model.js";
import { Review } from "../models/reviews.model.js";
import { Order } from "../models/order.model.js";

export const addReview = asyncHandler(async (req, res) => {
    const { foodId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    if (
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5 ||
        typeof comment !== "string" ||
        !comment.trim()
    ) {
        throw new ApiError(400, "Valid rating and comment are required");
    }

    const food = await Food.findById(foodId);

    if (!food) {
        throw new ApiError(404, "Food not found");
    }

    const existingReview = await Review.findOne({
        user: req.user._id,
        food: foodId
    });

    if (existingReview) {
        throw new ApiError(409, "You have already reviewed this food");
    }

    const ordered = await Order.findOne({
        user: req.user._id,
        "items.food": foodId,
        status: "Completed"
    });

    if (!ordered) {
        throw new ApiError(
            403,
            "You can review only food you have completed an order for"
        );
    }

    const review = await Review.create({
        user: req.user._id,
        food: foodId,
        rating: Number(rating),
        comment: comment.trim()
    });

    return res.status(201).json(
        new ApiResponse(201, review, "Review created successfully")
    );
});

export const getReview = asyncHandler(async (req, res) => {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    const food = await Food.findById(foodId);

    if (!food) {
        throw new ApiError(404, "Food not found");
    }

    const reviews = await Review.find({ food: foodId })
        .populate("user", "fullName profilePic")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, reviews, "Reviews fetched successfully")
    );
});

export const updateReview = asyncHandler(async (req, res) => {
    const { foodId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    if (rating === undefined && comment === undefined) {
        throw new ApiError(400, "At least one field is required");
    }

    if (
        rating !== undefined &&
        (!Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5)
    ) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    if (
        comment !== undefined &&
        (typeof comment !== "string" || !comment.trim())
    ) {
        throw new ApiError(400, "Comment cannot be empty");
    }

    const review = await Review.findOne({
        user: req.user._id,
        food: foodId
    });

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();

    return res.status(200).json(
        new ApiResponse(200, review, "Review updated successfully")
    );
});

export const deleteReview = asyncHandler(async (req, res) => {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    const review = await Review.findOne({
        user: req.user._id,
        food: foodId
    });

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    await review.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Review deleted successfully")
    );
});
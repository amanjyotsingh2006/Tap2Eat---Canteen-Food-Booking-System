import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Food } from "../models/food.model.js";
import { Review } from "../models/reviews.model.js";
import { Order } from "../models/order.model.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addReview = asyncHandler(async(req, res) => {
    const {foodId} = req.params
    const {rating, comment} = req.body

    if(!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID")
    }

    if(!rating || !comment) {
        throw new ApiError(400, "Rating and comment are required")
    }

    if(rating<1 || rating>5) {
        throw new ApiError(400, "Rating must be between 1 and 5")
    }

    const food = await Food.findById(foodId)

    if(!food) {
        throw new ApiError(404, "Food not found")
    }

    const existingReview = await Review.findOne({user: req.user._id, food: foodId})

    if(existingReview) {
        throw new ApiError(400, "You have already reviewed this food")
    }

    const ordered = await Order.findOne({user: req.user._id, "items.food": foodId, status: "Completed"})

    if(!ordered) {
        throw new ApiError(403, "You can review only food you have completed an order for")
    }

    const review = await Review.create({
        user: req.user._id,
        food: foodId,
        rating,
        comment: comment.trim()
    })

    await review.save()

    return res.status(201).json(
        new ApiResponse(
            201,
            review,
            "Review created Successfully"
        )
    )
})

export const getReview = asyncHandler(async(req, res) => {
    const {foodId} = req.params

    if(!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID")
    }

    const food = await Food.findById(foodId)

    if(!food) {
        throw new ApiError(404, "Food not found")
    }
    
    const reviews = await Review.find({food: foodId}).populate("user", "fullName profilePic").sort({createdAt: -1})

    if(!reviews) {
        throw new ApiError(404, "Reviews not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            reviews,
            "Review fetched Successfully"
        )
    )
})

export const updateReview = asyncHandler(async(req, res) => {
    const {foodId} = req.params
    const {rating, comment} = req.body

    if(!rating || !comment) {
        throw new ApiError(400, "Atleast one field is required")
    }

    if(rating && (rating < 1 || rating > 5)) {
        throw new ApiError(400, "Rating must be between 1 and 5")
    }

    if(!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID")
    }

    const review = await Review.findOne({food: foodId})

    if(!review) {
        throw new ApiError(404, "Review not found")
    }

    if(review.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized, Access denied") 
    }

    if(rating) review.rating = rating
    if(comment) review.comment = comment.trim()

    await review.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            review, 
            "Review updated Successfully"
        )
    )
})

export const deleteReview = asyncHandler(async(req, res) => {
    const {foodId} = req.params

    if(!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID")
    }

    const review = await Review.findOne({user: req.user._id, food: foodId})

    if(!review) {
        throw new ApiError(404, "Review not found")
    }

    if(review.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized, Access denied") 
    }

    await review.deleteOne()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Review deleted Successfully"
        )
    )
})
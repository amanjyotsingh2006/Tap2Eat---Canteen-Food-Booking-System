import mongoose from "mongoose";
import { Favourites } from "../models/favourites.model.js";
import { Food } from "../models/food.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addToFavourites = asyncHandler(async(req, res) => {
    const {foodId} = req.params

    if(!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid FoodId")
    }

    const food = await Food.findById(foodId)

    if(!food) {
        throw new ApiError(404, "Food not found")
    }

    const existingFavourites = await Favourites.findOne({user: req.user._id,food: foodId})

    if(existingFavourites) {
        throw new ApiError(400, "Food already in favourites")
    }

    const favourite = await Favourites.create({
        user: req.user._id,
        food: foodId
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            favourite,
            "Food added to favourites Successfully"
        )
    )
})

export const getFavourites = asyncHandler(async(req, res) => {
    const favourites = await Favourites.find({user: req.user._id}).populate("food")

    return res.status(200).json(
        new ApiResponse(
            200,
            favourites,
            "Favourites fetched Successfully"
        )
    )
})

export const removeFromFavourites = asyncHandler(async(req, res) => {
    const {foodId} = req.params

    if(!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid FoodId")
    }

    const favourite = await Favourites.findOne({user: req.user._id, food: foodId})

    if(!favourite) {
        throw new ApiError(404, "Food not found in Favourites")
    }   

    await favourite.deleteOne()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Food removed from Favourites Successfully"
        )
    )
})
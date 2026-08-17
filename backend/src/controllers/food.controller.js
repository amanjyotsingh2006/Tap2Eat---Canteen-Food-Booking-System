import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { Food } from "../models/food.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createFood = asyncHandler(async (req, res) => {
    const { name, description, price, image, category, preparationTime, available } = req.body

    if (!name || !description || !price || !image || !category || !preparationTime) {
        throw new ApiError(400, "All fields are required")
    }

    const existingCategory = await Category.findById(category)

    if (!existingCategory) {
        throw new ApiError(404, "Category not found")
    }

    const existingFood = await Food.findOne({ name: name.trim(), category })

    if (existingFood) {
        throw new ApiError(400, "Food already exist")
    }

    const food = await Food.create({
        name: name.trim(),
        description: description.trim(),
        price,
        image: image.trim(),
        category,
        preparationTime,
        available
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            food,
            "Food Created Successfully"
        )
    )
})

export const getFoods = asyncHandler(async (req, res) => {
    const food = await Food.find()

    if (!food || food.length == 0) {
        throw new ApiError(404, "No food found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            food,
            "Food fetched Successfully"
        )
    )
})

export const getFoodById = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Food Id")
    }

    const food = await Food.findById(id)

    if (!food) {
        throw new ApiError(404, "Food not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            food,
            "Food fetched by ID Successfully"
        )
    )
})

export const updateFood = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { name, description, price, image, category, preparationTime } = req.body

    if (!name && !description && !price && !image && !category && !preparationTime) {
        throw new ApiError(400, "Atleast one field is required")
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Food ID")
    }

    const food = await Food.findById(id)

    if (!food) {
        throw new ApiError(404, "Food not found")
    }

    if (name) food.name = name.trim()
    if (description) food.description = description.trim()
    if (price) food.price = price
    if (image) food.image = image.trim()
    if (category) {
        const existingCategory = await Category.findById(category);

        if (!existingCategory) {
            throw new ApiError(404, "Category not found");
        }

        food.category = category;
    }
    if (preparationTime) food.preparationTime = preparationTime

    await food.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            food,
            "Food Updated Successfully"
        )
    )
})

export const deleteFood = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Food ID")
    }

    const food = await Food.findById(id)

    if (!food) {
        throw new ApiError(404, "Food not found")
    }

    await food.deleteOne()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Food deleted Successfully"
        )
    )
})
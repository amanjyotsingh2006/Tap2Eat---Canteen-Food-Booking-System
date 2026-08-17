import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { name, image } = req.body

    if (!name.trim() || !image.trim()) {
        throw new ApiError(400, "Category name is required")
    }

    const existingCategory = await Category.findOne({ name: name.trim() })

    if (existingCategory) {
        throw new ApiError(400, "Category already exist")
    }

    const category = await Category.create({
        name: name.trim(),
        image: image.trim()
    })

    return res.status(200).json(
        new ApiResponse(
            201,
            category,
            "Category Added Successfully"
        )
    )

    await category.save()
})

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });

    if (!categories || categories.length == 0) {
        throw new ApiError(404, "No Categories found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            categories,
            "Categories fetched Successfully"
        )
    )
})

export const getCategoriesById = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid category ID")
    }

    const categoriesById = await Category.findById(id)

    if (!categoriesById) {
        throw new ApiError(404, "Category not found")
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            categoriesById,
            "Category fetched by ID Successfully"

        )
    )
})

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { name, image } = req.body

    if (!name && !image) {
        throw new ApiError(400, "Please provide atleast one field to update")
    }

    const category = await Category.findById(id)

    if (!category) {
        throw new ApiError(400, "Category not found")
    }

    if (name) category.name = name
    if (image) category.image = image

    await category.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            category,
            "Category updated Successfully"
        )
    )
})

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Category ID")
    }

    const category = await Category.findById(id)

    if (!category) {
        throw new ApiError(404, "Category not found")
    }

    await category.deleteOne()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Category deleted Successfully"
        )
    )
})
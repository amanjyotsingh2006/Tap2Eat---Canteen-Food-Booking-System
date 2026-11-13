import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { Food } from "../models/food.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { name, image } = req.body;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof image !== "string" ||
        !image.trim()
    ) {
        throw new ApiError(400, "Category name and image are required");
    }

    const normalizedName = name.trim();

    const existingCategory = await Category.findOne({
        name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
    });

    if (existingCategory) {
        throw new ApiError(409, "Category already exists");
    }

    const category = await Category.create({
        name: normalizedName,
        image: image.trim()
    });

    return res.status(201).json(
        new ApiResponse(201, category, "Category added successfully")
    );
});

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});

export const getCategoriesById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Category ID");
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json(
        new ApiResponse(200, category, "Category fetched successfully")
    );
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, image } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Category ID");
    }

    if (name === undefined && image === undefined) {
        throw new ApiError(400, "Provide at least one field to update");
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ApiError(400, "Invalid category name");
        }

        const duplicate = await Category.findOne({
            _id: { $ne: id },
            name: { $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
        });

        if (duplicate) {
            throw new ApiError(409, "Category name already exists");
        }

        category.name = name.trim();
    }

    if (image !== undefined) {
        if (typeof image !== "string" || !image.trim()) {
            throw new ApiError(400, "Invalid category image");
        }

        category.image = image.trim();
    }

    await category.save();

    return res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Category ID");
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    const hasFoods = await Food.exists({ category: id });

    if (hasFoods) {
        throw new ApiError(
            409,
            "Cannot delete this category because food items are assigned to it"
        );
    }

    await category.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Category deleted successfully")
    );
});
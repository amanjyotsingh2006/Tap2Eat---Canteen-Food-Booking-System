import mongoose from "mongoose";

import { Category } from "../models/category.model.js";
import { Food } from "../models/food.model.js";

import { Cart } from "../models/cart.model.js";
import { Favourites } from "../models/favourites.model.js";
import { Review } from "../models/reviews.model.js";
import { Order } from "../models/order.model.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createFood = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        image,
        category,
        preparationTime,
        available = "Yes"
    } = req.body;

    if (
        !name?.trim() ||
        !description?.trim() ||
        price === undefined ||
        !image?.trim() ||
        !category ||
        preparationTime === undefined
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
        throw new ApiError(400, "Invalid Category ID");
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        throw new ApiError(400, "Invalid food price");
    }

    if (
        !Number.isFinite(Number(preparationTime)) ||
        Number(preparationTime) < 1
    ) {
        throw new ApiError(400, "Invalid preparation time");
    }

    if (!["Yes", "No"].includes(available)) {
        throw new ApiError(400, "Availability must be Yes or No");
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
        throw new ApiError(404, "Category not found");
    }

    const existingFood = await Food.findOne({
        name: name.trim(),
        category
    });

    if (existingFood) {
        throw new ApiError(409, "Food already exists in this category");
    }

    const food = await Food.create({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        image: image.trim(),
        category,
        preparationTime: Number(preparationTime),
        available
    });

    return res.status(201).json(
        new ApiResponse(201, food, "Food created successfully")
    );
});

export const getFoods = asyncHandler(async (req, res) => {
    const foods = await Food.find()
        .populate("category")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, foods, "Food fetched successfully")
    );
});

export const getFoodById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    const food = await Food.findById(id).populate("category");

    if (!food) {
        throw new ApiError(404, "Food not found");
    }

    return res.status(200).json(
        new ApiResponse(200, food, "Food fetched successfully")
    );
});

export const updateFood = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    const food = await Food.findById(id);

    if (!food) {
        throw new ApiError(404, "Food not found");
    }

    const {
        name,
        description,
        price,
        image,
        category,
        preparationTime,
        available
    } = req.body;

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ApiError(400, "Invalid food name");
        }
        food.name = name.trim();
    }

    if (description !== undefined) {
        if (typeof description !== "string" || !description.trim()) {
            throw new ApiError(400, "Invalid description");
        }
        food.description = description.trim();
    }

    if (price !== undefined) {
        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            throw new ApiError(400, "Invalid food price");
        }
        food.price = Number(price);
    }

    if (image !== undefined) {
        if (typeof image !== "string" || !image.trim()) {
            throw new ApiError(400, "Invalid image URL");
        }
        food.image = image.trim();
    }

    if (category !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            throw new ApiError(400, "Invalid Category ID");
        }

        const existingCategory = await Category.findById(category);

        if (!existingCategory) {
            throw new ApiError(404, "Category not found");
        }

        food.category = category;
    }

    if (preparationTime !== undefined) {
        if (
            !Number.isFinite(Number(preparationTime)) ||
            Number(preparationTime) < 1
        ) {
            throw new ApiError(400, "Invalid preparation time");
        }
        food.preparationTime = Number(preparationTime);
    }

    if (available !== undefined) {
        if (!["Yes", "No"].includes(available)) {
            throw new ApiError(400, "Availability must be Yes or No");
        }
        food.available = available;
    }

    await food.save();

    return res.status(200).json(
        new ApiResponse(200, food, "Food updated successfully")
    );
});

export const deleteFood = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    const food = await Food.findById(id);

    if (!food) {
        throw new ApiError(404, "Food not found");
    }

    // Preserve food references in historical orders.
    const usedInOrders = await Order.exists({
        "items.food": id
    });

    if (usedInOrders) {
        throw new ApiError(
            409,
            "This food is present in order history. Mark it unavailable instead of deleting it."
        );
    }

    // Remove the food from users' carts and recalculate totals.
    const carts = await Cart.find({
        "items.food": id
    });

    for (const cart of carts) {
        cart.items = cart.items.filter(
            item => item.food.toString() !== id
        );

        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();
    }

    await Favourites.deleteMany({ food: id });
    await Review.deleteMany({ food: id });

    await food.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Food deleted successfully")
    );
});
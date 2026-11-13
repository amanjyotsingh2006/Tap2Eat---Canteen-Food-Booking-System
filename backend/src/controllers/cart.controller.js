import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Food } from "../models/food.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addToCart = asyncHandler(async (req, res) => {
    const { foodId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, "Quantity must be a positive integer");
    }

    const food = await Food.findById(foodId);

    if (!food) {
        throw new ApiError(404, "Food not found");
    }

    if (food.available !== "Yes") {
        throw new ApiError(400, "Food is currently unavailable");
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [],
            totalPrice: 0
        });
    }

    const existingItem = cart.items.find(
        item => item.food.toString() === foodId
    );

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = food.price;
    } else {
        cart.items.push({
            food: food._id,
            quantity,
            price: food.price
        });
    }

    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Item added to cart successfully")
    );
});

export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate("items.food");

    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, {
                items: [],
                totalPrice: 0
            }, "Cart is empty")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart fetched successfully")
    );
});

export const updateCartItem = asyncHandler(async (req, res) => {
    const { foodId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, "Quantity must be a positive integer");
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find(
        item => item.food.toString() === foodId
    );

    if (!item) {
        throw new ApiError(404, "Food not found in cart");
    }

    const food = await Food.findById(foodId);

    if (!food || food.available !== "Yes") {
        throw new ApiError(400, "Food is currently unavailable");
    }

    item.quantity = quantity;
    item.price = food.price;

    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart updated successfully")
    );
});

export const removeCartItem = asyncHandler(async (req, res) => {
    const { foodId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new ApiError(400, "Invalid Food ID");
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemExists = cart.items.some(
        item => item.food.toString() === foodId
    );

    if (!itemExists) {
        throw new ApiError(404, "Food not found in cart");
    }

    cart.items = cart.items.filter(
        item => item.food.toString() !== foodId
    );

    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Food removed from cart successfully")
    );
});

export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Cart is already empty")
        );
    }

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart cleared successfully")
    );
});
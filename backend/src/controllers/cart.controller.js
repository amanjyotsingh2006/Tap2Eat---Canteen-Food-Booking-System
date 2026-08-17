import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Food } from "../models/food.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addToCart = asyncHandler(async (req, res) => {
    const { foodId, quantity } = req.body

    if (!foodId) {
        throw new ApiError(400, "Invalid Id")
    }

    const food = await Food.findById(foodId)

    if (!food) {
        throw new ApiError(404, "Food not found")
    }

    if (!food.available) {
        throw new ApiError(400, "Food is currently  unavailable")
    }

    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        const cart = await Cart.create({
            user: req.user._id,
            items: [],
            totalPrice: 0
        })
    }

    const existingCart = await cart.items.find(
        (items) => items.food.toString() === foodId
    )

    if (existingCart) {
        existingCart.quantity += 1 || 1
    }
    else {
        cart.items.push({
            food: food._id,
            quantity: quantity || 1,
            price: food.price
        })
    }

    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )

    await cart.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Items added to cart successfully"
        )
    )
})

export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.food")

    if (!cart) {
        throw new ApiError(400, "Cart is Empty")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Cart fetched Successfully"
        )
    )
})

export const updateCartItem = asyncHandler(async (req, res) => {
    const { foodId } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Valid quantity is required")
    }

    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        throw new ApiError(400, "Cart not found")
    }

    const items = cart.items.find(
        (item) => item.food.toString() === foodId
    )

    if (!items) {
        throw new ApiError(400, "Food not found in cart")
    }

    items.quantity = quantity

    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )

    await cart.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Cart updated Successfully"
        )
    )
})

export const removeCartItem = asyncHandler(async(req, res) => {
    const {foodId} = req.params

    const cart = await Cart.findOne({user: req.user._id})

    if(!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const item = cart.items.find(
        (item) => item.food.toString() === foodId
    )

    if(!item) {
        throw new ApiError(404, "Food not found in cart")
    }

    cart.items = cart.items.filter(
        (item) => item.food.toString() != foodId
    )

    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )

    await cart.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Food removed from cart Successfully"
        )
    )
})

export const clearCart = asyncHandler(async(req, res) => {
    const cart = await Cart.findOne({user: req.user._id})

    if(!cart) {
        throw new ApiError(404, "Cart not found")
    }

    cart.items = []
    cart.totalPrice = 0

    await cart.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Cart cleared Successfully"
        )
    )
})
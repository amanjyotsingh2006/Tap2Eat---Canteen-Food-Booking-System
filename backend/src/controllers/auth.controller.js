import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import { User } from "../models/user.model.js";

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../tokens/generateToken.js";

import googleClient from "../config/google.js";


export const register = asyncHandler(async (req, res) => {
    const { email, fullName, password, confirmPassword, phone } = req.body

    if (!email || !fullName || !password || !confirmPassword || !phone) {
        throw new ApiError(400, "All fields are required")
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedName = fullName.trim()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalizedEmail)) {
        throw new ApiError(400, "Invalid email")
    }

    // Validate full name
    if (!trimmedName) {
        throw new ApiError(400, "Full name is required")
    }

    // Validate phone
    if (!/^\d{10}$/.test(phone)) {
        throw new ApiError(400, "Phone must be exactly 10 digits")
    }

    // Validate password
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters")
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match")
    }

    // Check existing user
    const existingUser = await User.findOne({
        email: normalizedEmail
    })

    if (existingUser) {
        throw new ApiError(409, "User already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}`

    const user = await User.create({
        fullName: trimmedName,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        profilePic: avatar,
        role: "user"
    })

    const registeredUser = await User.findById(user._id)
        .select("-password -refreshToken")

    return res.status(201).json(
        new ApiResponse(
            201,
            registeredUser,
            "User registered successfully"
        )
    )
})



export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    const user = await User.findOne({
        email: email.trim().toLowerCase()
    })

    if (!user || !user.password) {
        throw new ApiError(401, "Invalid email or password")
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    )

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password")
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = refreshToken

    await user.save({
        validateBeforeSave: false
    })

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "Login successful"
        )
    )
})


export const logout = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        )
})


export const googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body

    if (!credential) {
        throw new ApiError(400, "Google credential is required")
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    const {
        email,
        name,
        picture,
        sub,
        email_verified
    } = payload

    if (!email || !sub || !email_verified) {
        throw new ApiError(401, "Invalid Google account")
    }

    const normalizedEmail = email.toLowerCase()

    // Find existing user
    let user = await User.findOne({
        email: normalizedEmail
    })

    // Create new user if not found
    if (!user) {
        user = await User.create({
            fullName: name,
            email: normalizedEmail,
            profilePic: picture,
            googleId: sub,
            role: "user"
        })
    } else {
        // Prevent linking a different Google account
        if (user.googleId && user.googleId !== sub) {
            throw new ApiError(401, "Google account mismatch")
        }

        if (!user.googleId) {
            user.googleId = sub
        }

        await user.save({
            validateBeforeSave: false
        })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = refreshToken

    await user.save({
        validateBeforeSave: false
    })

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "Google login successful"
        )
    )
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken =
        req.body.refreshToken ||
        req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken.id);

    if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json(
        new ApiResponse(
            200,
            { accessToken },
            "Access token refreshed successfully"
        )
    );
});
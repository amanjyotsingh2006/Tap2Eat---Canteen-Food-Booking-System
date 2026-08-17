import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import { User } from "../models/user.model.js";

import bcrypt from "bcrypt"
import { generateAccessToken, generateRefreshToken } from "../tokens/generateToken.js";

import googleClient from "../config/google.js";

export const register = asyncHandler(async (req, res) => {
    const { email, fullName, password, confirmPassword, phone, role } = req.body

    if (!(email && fullName && password && confirmPassword && phone)) {
        throw new ApiError(400, "Missing fields are required")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid Email")
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exist")
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must atleast 6 characters")
    }

    if (password != confirmPassword) {
        throw new ApiError(400, "Password do not match")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    if (phone.length != 10) {
        throw new ApiError(400, "Phone must must be 10 characters")
    }

    const avatar = `https://ui-avatars.com/api/?name=${fullName}`

    const user = await User.create({
        fullName,
        email,
        phone,
        password: hashedPassword,
        profilePic: avatar,
        role
    })

    return res.status(200).json(
        new ApiResponse(201, user, "User registered successfully")
    )
})

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!(email && password)) {
        throw new ApiError(400, "Missing Fields required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid email or password")
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save({
        validateBeforeSave: false
    })

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

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
        req.user_id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User Logged Out Successfully"
            )
        )
})

export const googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body

    if (!credential) {
        throw new ApiError(400, "Google Credential Required")
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload();

    const {
        email,
        name,
        picture,
        sub
    } = payload;

    const user = await User.findOne({email})

    if(!user) {
        user = await User.create({
            fullName: name,
            email,
            profilePic: picture,
            googleId: sub
        })
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = refreshToken

    await user.save({validateBeforeSave: false})

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "Google Login Successful"
        )
    )
})

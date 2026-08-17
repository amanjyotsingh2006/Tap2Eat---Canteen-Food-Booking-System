import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    }
}, {timestamps: true})

export const Favourites = mongoose.model("Favourites", favouriteSchema)
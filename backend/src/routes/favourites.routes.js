import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { addToFavourites, getFavourites, removeFromFavourites } from "../controllers/favourite.controller.js"

const router = express.Router()

router.post("/add/:foodId", protectRoute, addToFavourites)
router.get("/", protectRoute, getFavourites)
router.delete("/delete/:foodId", protectRoute, removeFromFavourites)

export default router
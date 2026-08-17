import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { addReview, deleteReview, getReview, updateReview } from "../controllers/reviews.controller.js"

const router = express.Router()

router.post("/add/:foodId", protectRoute, addReview)
router.get("/getReview/:foodId", protectRoute, getReview)
router.patch("/update/:foodId", protectRoute, updateReview)
router.delete("/remove/:foodId", protectRoute, deleteReview)

export default router
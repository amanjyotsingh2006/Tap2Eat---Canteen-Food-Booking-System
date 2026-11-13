import express from "express"
import { createFood, deleteFood, getFoodById, getFoods, updateFood } from "../controllers/food.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"
import { isAdmin } from "../middleware/admin.middleware.js"

const router = express.Router()

router.post("/add", protectRoute, isAdmin, createFood)
router.get("/", protectRoute, getFoods)
router.get("/:id", protectRoute, getFoodById)
router.patch("/:id", protectRoute, isAdmin, updateFood)
router.delete("/:id", protectRoute, isAdmin, deleteFood)

export default router
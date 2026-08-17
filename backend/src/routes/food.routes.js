import express from "express"
import { createFood, deleteFood, getFoodById, getFoods, updateFood } from "../controllers/food.controller.js"

const router = express.Router()

router.post("/add", createFood)
router.get("/", getFoods)
router.get("/:id", getFoodById)
router.patch("/:id", updateFood)
router.delete("/:id", deleteFood)

export default router
import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cart.controller.js"

const router = express.Router()

router.post("/add", protectRoute, addToCart)
router.get("/", protectRoute, getCart)
router.patch("/update/:foodId", protectRoute, updateCartItem)
router.delete("/remove/:foodId", protectRoute, removeCartItem)
router.delete("/clear", protectRoute, clearCart)

export default router

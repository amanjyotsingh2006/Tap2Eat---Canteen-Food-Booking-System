import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { isAdmin } from "../middleware/admin.middleware.js"
import { cancelOrder, getAllOrders, getOrderById, getOrders, placeOrder, updateOrderStatus } from "../controllers/order.controller.js"

const router = express.Router()

router.post("/placeOrder", protectRoute, placeOrder)
router.get("/getOrders", protectRoute, getOrders)
router.get("/getOrder/:id", protectRoute, getOrderById)
router.patch("/cancelOrder/:id", protectRoute, cancelOrder)
router.get("/getAllOrders", protectRoute, isAdmin, getAllOrders)
router.patch("/updateOrderStatus/:id", protectRoute, isAdmin, updateOrderStatus)

export default router
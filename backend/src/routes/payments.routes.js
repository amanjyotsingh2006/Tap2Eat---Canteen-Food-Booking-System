import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { createPayment, getPayment, refundPayment, verifyPayment } from "../controllers/payments.controller.js"

const router = express.Router()

router.post("/create", protectRoute, createPayment)
router.post("/verify", protectRoute, verifyPayment)
router.get("/:orderId", protectRoute, getPayment)
router.patch("/refund/:id", protectRoute, refundPayment)


export default router
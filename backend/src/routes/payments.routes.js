import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
    createPayment,
    getPayment,
    refundPayment,
    verifyPayment,
    collectPayment
} from "../controllers/payments.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createPayment);

// Retained temporarily so old frontend calls receive a clear error.
router.post("/verify", protectRoute, verifyPayment);

router.get("/:orderId", protectRoute, getPayment);

router.patch("/collect/:id", protectRoute, isAdmin, collectPayment);
router.patch("/refund/:id", protectRoute, isAdmin, refundPayment);

export default router;
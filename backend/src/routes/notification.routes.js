import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { createNotification, deleteNotification, getNotification, markNotificationAsRead } from "../controllers/notification.controller.js"
import { isAdmin } from "../middleware/admin.middleware.js"

const router = express.Router()

router.post("/create", protectRoute, isAdmin, createNotification)
router.get("/get", protectRoute, getNotification)
router.patch("/markAsRead/:id", protectRoute, markNotificationAsRead)
router.delete("/delete/:id", protectRoute, deleteNotification)

export default router
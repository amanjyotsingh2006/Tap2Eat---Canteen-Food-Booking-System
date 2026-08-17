import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { profile, updatePassword, updateProfile, } from "../controllers/user.controller.js"

const router = express.Router()

router.get("/profile", protectRoute, profile)
router.patch("/profile", protectRoute, updateProfile)
router.patch("/change-password", protectRoute, updatePassword)

export default router
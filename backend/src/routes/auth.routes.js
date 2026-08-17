import express from "express"

import { register, login, logout, googleLogin } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/google-login", googleLogin)
router.post("/logout", logout)

export default router;
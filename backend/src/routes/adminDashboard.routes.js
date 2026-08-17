import express from "express"
import { isAdmin } from "../middleware/admin.middleware.js"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getDashboard, getRecentOrders, getRevenue, getTopCustomers, getTopFoods } from "../controllers/adminDashboard.controller.js"

const router = express.Router()

router.get("/", protectRoute, isAdmin, getDashboard)
router.get("/revenue", protectRoute, isAdmin, getRevenue)
router.get("/recent-orders", protectRoute, isAdmin, getRecentOrders)
router.get("/top-foods", protectRoute, isAdmin, getTopFoods)
router.get("/top-customers", protectRoute, isAdmin, getTopCustomers)

export default router
import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCategory, deleteCategory, getCategories, getCategoriesById, updateCategory } from "../controllers/category.controller.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router()

router.post("/add", protectRoute, isAdmin, createCategory)
router.get("/", protectRoute, isAdmin, getCategories)
router.get("/:id", protectRoute, isAdmin, getCategoriesById)
router.patch("/:id", protectRoute, isAdmin, updateCategory)
router.delete("/:id", protectRoute, isAdmin, deleteCategory)

export default router;
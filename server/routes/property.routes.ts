import { Router } from "express";
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { ownerMiddleware } from "../middleware/owner.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// Public routes
router.get("/", getAllProperties);
router.get("/:id", getPropertyById);

// Protected routes (Host/Admin actions)
router.post("/", authMiddleware, upload.array("images", 5), createProperty);
router.put("/:id", authMiddleware, ownerMiddleware, updateProperty);
router.delete("/:id", authMiddleware, ownerMiddleware, deleteProperty);

export default router;

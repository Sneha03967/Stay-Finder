import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
} from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createBooking);
router.get("/my", authMiddleware, getUserBookings);
router.patch("/:id/cancel", authMiddleware, cancelBooking);

export default router;

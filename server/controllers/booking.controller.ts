import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Property } from "../models/Property";
import { memoryStore } from "../models/User";
import { checkMongoConnected } from "../db";

export async function createBooking(req: Request, res: Response): Promise<void> {
  const { propertyId, checkIn, checkOut } = req.body;
  const userId = (req as any).user?.id;

  if (!propertyId || !checkIn || !checkOut) {
    res.status(400).json({ message: "Property, check-in, and check-out dates are required." });
    return;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Validate check-out is after check-in
  if (checkOutDate <= checkInDate) {
    res.status(400).json({ message: "Check-out date must be after the check-in date." });
    return;
  }

  const oneDay = 24 * 60 * 60 * 1000;
  const daysCount = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / oneDay);

  try {
    if (checkMongoConnected()) {
      // 1. Mongoose Database Mode
      const property = await Property.findById(propertyId);
      if (!property) {
        res.status(404).json({ message: "Property not found." });
        return;
      }

      // Query for conflicting bookings
      const conflict = await Booking.findOne({
        property: propertyId,
        status: { $ne: "cancelled" },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      });

      if (conflict) {
        res.status(400).json({ message: "Property not available for selected dates. Try other dates." });
        return;
      }

      const totalPrice = daysCount * property.price;

      const newBooking = new Booking({
        user: userId,
        property: propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: "confirmed", // Default check can be 'confirmed' as it represents a successful creation
      });

      const saved = await newBooking.save();
      res.status(201).json(saved);
    } else {
      // 2. In-Memory Mock Mode
      const property = memoryStore.properties.find((p) => p._id === propertyId);
      if (!property) {
        res.status(404).json({ message: "Property not found." });
        return;
      }

      // Check conflicts in-memory
      const conflict = memoryStore.bookings.find((b) => {
        return (
          b.property === propertyId &&
          b.status !== "cancelled" &&
          new Date(b.checkIn) < checkOutDate &&
          new Date(b.checkOut) > checkInDate
        );
      });

      if (conflict) {
        res.status(400).json({ message: "Property not available for selected dates. Try other dates." });
        return;
      }

      const totalPrice = daysCount * property.price;

      const newId = `booking_${Date.now()}`;
      const newMemoryBooking = {
        _id: newId,
        user: userId,
        property: propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: "confirmed" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.bookings.push(newMemoryBooking);
      res.status(201).json(newMemoryBooking);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create booking.", error: error.message });
  }
}

export async function getUserBookings(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?.id;

  try {
    if (checkMongoConnected()) {
      const bookings = await Booking.find({ user: userId })
        .populate("property", "title location images price")
        .sort({ createdAt: -1 });
      res.json(bookings);
    } else {
      const userBookings = memoryStore.bookings.filter((b) => b.user === userId);

      // Populate property
      const populated = userBookings.map((b) => {
        const prop = memoryStore.properties.find((p) => p._id === b.property);
        return {
          ...b,
          property: prop
            ? {
                _id: prop._id,
                title: prop.title,
                location: prop.location,
                images: prop.images,
                price: prop.price,
              }
            : null,
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(populated);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch bookings.", error: error.message });
  }
}

export async function cancelBooking(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    if (checkMongoConnected()) {
      const booking = await Booking.findById(id);
      if (!booking) {
        res.status(404).json({ message: "Booking not found." });
        return;
      }

      if (booking.user.toString() !== userId) {
        res.status(403).json({ message: "Forbidden: You are not authorized to cancel this booking." });
        return;
      }

      booking.status = "cancelled";
      const saved = await booking.save();
      res.json(saved);
    } else {
      const index = memoryStore.bookings.findIndex((b) => b._id === id);
      if (index === -1) {
        res.status(404).json({ message: "Booking not found." });
        return;
      }

      const booking = memoryStore.bookings[index];
      if (booking.user !== userId) {
        res.status(403).json({ message: "Forbidden: You are not authorized to cancel this booking." });
        return;
      }

      const updatedBooking = {
        ...booking,
        status: "cancelled" as const,
        updatedAt: new Date(),
      };

      memoryStore.bookings[index] = updatedBooking;
      res.json(updatedBooking);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to cancel booking.", error: error.message });
  }
}

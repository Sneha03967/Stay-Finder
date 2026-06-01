import mongoose from "mongoose";
import { memoryStore } from "./models/User";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/airbnbclone";

let isMongoConnected = false;

export async function connectDB() {
  try {
    // Set low timeout so we don't block the server boot if MongoDB is not present
    mongoose.set("bufferCommands", false);
    
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log("MongoDB Connected Successfully ✅");
  } catch (error: any) {
    console.log("MongoDB Connection Failed ❌ - Falling back to local responsive in-memory store.");
    console.log("Error details:", error.message);
    isMongoConnected = false;
  }
}

export function checkMongoConnected(): boolean {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

// Seed the in-memory fallback initially with mock hosts, listings, and bookings
export function seedInMemoryStore() {
  if (memoryStore.users.length > 0) return;

  // 1. Seed Hosts
  const hostUser = {
    _id: "host_john_123",
    name: "John Doe",
    email: "john@example.com",
    role: "host" as const,
    passwordHash: "$2a$10$716752391642839178263728", // hashed 'password123'
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const guestUser = {
    _id: "guest_jane_456",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "guest" as const,
    passwordHash: "$2a$10$716752391642839178263728",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  memoryStore.users.push(hostUser);
  memoryStore.users.push(guestUser);

  // 2. Seed Properties
  const prop1 = {
    _id: "prop_studio_01",
    title: "Midtown Cozy Studio Loft",
    description: "Centrally located modern studio featuring high ceilings, stainless steel appliances, and a beautiful view of the city skyline. Just blocks away from subways and parks.",
    location: "New York, NY",
    price: 135,
    images: [], // Will fallback to nice placeholders
    propertyType: "apartment" as const,
    amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Gym", "Workspace"],
    owner: hostUser._id,
    isAvailable: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
  };

  const prop2 = {
    _id: "prop_villa_02",
    title: "Vibrant Miami Beachfront Villa",
    description: "An incredible private villa with direct access to the white sand. Includes a gorgeous infinity pool, extensive deck, barbecue grill, and outdoor lounge areas.",
    location: "Miami, FL",
    price: 490,
    images: [],
    propertyType: "villa" as const,
    amenities: ["Wi-Fi", "Pool", "Beach Access", "Kitchen", "Hot Tub", "Free Parking"],
    owner: hostUser._id,
    isAvailable: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
  };

  const prop3 = {
    _id: "prop_house_03",
    title: "Charming Puget Sound Cottage",
    description: "A private craftsman home nestled in towering evergreens. Perfect romantic or meditative retreat. Enjoy your morning coffee on the wooden deck listening to the eagles.",
    location: "Seattle, WA",
    price: 185,
    images: [],
    propertyType: "house" as const,
    amenities: ["Wi-Fi", "Fireplace", "Kitchen", "Patio", "Mountain View"],
    owner: hostUser._id,
    isAvailable: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  };

  const prop4 = {
    _id: "prop_room_04",
    title: "Sunny Artist Room near Downtown",
    description: "Cozy shared house room with an vintage record player, writing desk, and skylight window. Shared bathroom and full kitchen with friendly graphic designer host.",
    location: "Boston, MA",
    price: 65,
    images: [],
    propertyType: "room" as const,
    amenities: ["Wi-Fi", "Workspace", "Shared Kitchen", "Washing Machine"],
    owner: hostUser._id,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  memoryStore.properties.push(prop1, prop2, prop3, prop4);

  // 3. Seed Booking
  const booking1 = {
    _id: "booking_01",
    user: guestUser._id,
    property: prop1._id,
    checkIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // in 2 days
    checkOut: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // in 5 days
    totalPrice: 405, // 3 nights * $135
    status: "confirmed" as const,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  memoryStore.bookings.push(booking1);
  console.log("Pre-seeded in-memory store with mock hosts, guests, listings, and bookings! 💫");
}

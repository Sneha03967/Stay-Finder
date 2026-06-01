import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["guest", "host", "admin"], default: "guest" },
  },
  { timestamps: true }
);

// Fallback in-memory users list for preview when MongoDB is unavailable
export interface IUserMemory {
  _id: string;
  name: string;
  email: string;
  role: "guest" | "host" | "admin";
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export const memoryStore = {
  users: [] as IUserMemory[],
  properties: [] as any[],
  bookings: [] as any[]
};

export const User: mongoose.Model<any> = mongoose.models.User || mongoose.model("User", UserSchema);

import mongoose, { Schema } from "mongoose";

const PropertySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    propertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "room"],
      required: true
    },
    amenities: { type: [String], default: [] },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface IPropertyMemory {
  _id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  images: string[];
  propertyType: "apartment" | "house" | "villa" | "room";
  amenities: string[];
  owner: string; // User ID
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const Property: mongoose.Model<any> = mongoose.models.Property || mongoose.model("Property", PropertySchema);

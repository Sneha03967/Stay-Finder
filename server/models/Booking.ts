import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export interface IBookingMemory {
  _id: string;
  user: string;
  property: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export const Booking: mongoose.Model<any> = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

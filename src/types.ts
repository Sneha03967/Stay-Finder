export interface User {
  id: string;
  name: string;
  email: string;
  role: "guest" | "host" | "admin";
}

export interface Property {
  _id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  images: string[];
  propertyType: "apartment" | "house" | "villa" | "room";
  amenities: string[];
  owner: {
    _id: string;
    name: string;
    email?: string;
  } | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  user: string;
  property: {
    _id: string;
    title: string;
    location: string;
    images: string[];
    price: number;
  } | null;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

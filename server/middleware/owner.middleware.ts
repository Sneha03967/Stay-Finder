import { Request, Response, NextFunction } from "express";
import { Property } from "../models/Property";
import { checkMongoConnected } from "../db";
import { memoryStore } from "../models/User";

export async function ownerMiddleware(req: Request, res: Response, next: NextFunction) {
  const propertyId = req.params.id;
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ message: "User authentication required." });
    return;
  }

  try {
    let propertyOwnerId: string | undefined;

    if (checkMongoConnected()) {
      const property = await Property.findById(propertyId);
      if (!property) {
        res.status(404).json({ message: "Property not found." });
        return;
      }
      propertyOwnerId = property.owner.toString();
    } else {
      const property = memoryStore.properties.find((p) => p._id === propertyId);
      if (!property) {
        res.status(404).json({ message: "Property not found in local store." });
        return;
      }
      propertyOwnerId = property.owner;
    }

    if (propertyOwnerId !== userId) {
      res.status(403).json({ message: "Forbidden: You do not own this property." });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: "Server error in owner middleware.", error: error.message });
  }
}

import { Request, Response } from "express";
import { Property } from "../models/Property";
import { User, memoryStore } from "../models/User";
import { checkMongoConnected } from "../db";

export async function getAllProperties(req: Request, res: Response): Promise<void> {
  const { location, minPrice, maxPrice, propertyType } = req.query;

  try {
    if (checkMongoConnected()) {
      // 1. Mongoose Database Mode
      const filter: any = {};

      if (location) {
        filter.location = { $regex: String(location).trim(), $options: "i" };
      }
      if (propertyType && propertyType !== "all") {
        filter.propertyType = String(propertyType);
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const properties = await Property.find(filter).populate("owner", "name email");
      res.json(properties);
    } else {
      // 2. In-Memory Mock Mode
      let filtered = [...memoryStore.properties];

      if (location) {
        const queryLoc = String(location).toLowerCase().trim();
        filtered = filtered.filter((p) => p.location.toLowerCase().includes(queryLoc));
      }
      if (propertyType && propertyType !== "all") {
        filtered = filtered.filter((p) => p.propertyType === propertyType);
      }
      if (minPrice) {
        filtered = filtered.filter((p) => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter((p) => p.price <= Number(maxPrice));
      }

      // Populate Owner
      const populated = filtered.map((p) => {
        const ownerInfo = memoryStore.users.find((u) => u._id === p.owner);
        return {
          ...p,
          owner: ownerInfo ? { _id: ownerInfo._id, name: ownerInfo.name, email: ownerInfo.email } : null,
        };
      });

      res.json(populated);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch properties.", error: error.message });
  }
}

export async function getPropertyById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    if (checkMongoConnected()) {
      const property = await Property.findById(id).populate("owner", "name");
      if (!property) {
        res.status(404).json({ message: "Property listing not found." });
        return;
      }
      res.json(property);
    } else {
      const property = memoryStore.properties.find((p) => p._id === id);
      if (!property) {
        res.status(404).json({ message: "Property listing not found." });
        return;
      }

      const ownerInfo = memoryStore.users.find((u) => u._id === property.owner);
      const populated = {
        ...property,
        owner: ownerInfo ? { _id: ownerInfo._id, name: ownerInfo.name } : null,
      };

      res.json(populated);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch property details.", error: error.message });
  }
}

export async function createProperty(req: Request, res: Response): Promise<void> {
  const { title, description, location, price, propertyType, amenities } = req.body;
  const ownerId = (req as any).user?.id;

  if (!title || !location || !price || !propertyType) {
    res.status(400).json({ message: "Title, location, price, and property type are required fields." });
    return;
  }

  // Get image filenames from uploaded files if any
  const imageFiles = req.files as Express.Multer.File[] | undefined;
  const imageFilenames = imageFiles ? imageFiles.map((f) => f.filename) : [];

  // Handle optional list parsing
  let amenitiesArray: string[] = [];
  if (amenities) {
    if (Array.isArray(amenities)) {
      amenitiesArray = amenities;
    } else {
      amenitiesArray = String(amenities)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
  }

  try {
    if (checkMongoConnected()) {
      const newProperty = new Property({
        title,
        description,
        location,
        price: Number(price),
        propertyType,
        images: imageFilenames,
        amenities: amenitiesArray,
        owner: ownerId,
      });

      const saved = await newProperty.save();
      res.status(201).json(saved);
    } else {
      const newId = `prop_${Date.now()}`;
      const newMemoryProperty = {
        _id: newId,
        title,
        description,
        location,
        price: Number(price),
        propertyType,
        images: imageFilenames,
        amenities: amenitiesArray,
        owner: ownerId,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.properties.push(newMemoryProperty);
      res.status(201).json(newMemoryProperty);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create property.", error: error.message });
  }
}

export async function updateProperty(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { title, description, location, price, propertyType, amenities, isAvailable } = req.body;

  try {
    // Note: owner validation has already been successfully accomplished by ownerMiddleware
    const parsedPrice = price !== undefined ? Number(price) : undefined;
    let amenitiesArray: string[] | undefined;
    if (amenities !== undefined) {
      if (Array.isArray(amenities)) {
        amenitiesArray = amenities;
      } else {
        amenitiesArray = String(amenities)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }

    if (checkMongoConnected()) {
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (location !== undefined) updateData.location = location;
      if (parsedPrice !== undefined) updateData.price = parsedPrice;
      if (propertyType !== undefined) updateData.propertyType = propertyType;
      if (amenitiesArray !== undefined) updateData.amenities = amenitiesArray;
      if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

      const updated = await Property.findByIdAndUpdate(id, updateData, { new: true });
      res.json(updated);
    } else {
      const index = memoryStore.properties.findIndex((p) => p._id === id);
      if (index === -1) {
        res.status(404).json({ message: "Property not found." });
        return;
      }

      const existing = memoryStore.properties[index];
      const updatedMemory = {
        ...existing,
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        location: location !== undefined ? location : existing.location,
        price: parsedPrice !== undefined ? parsedPrice : existing.price,
        propertyType: propertyType !== undefined ? propertyType : existing.propertyType,
        amenities: amenitiesArray !== undefined ? amenitiesArray : existing.amenities,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existing.isAvailable,
        updatedAt: new Date(),
      };

      memoryStore.properties[index] = updatedMemory;
      res.json(updatedMemory);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update property.", error: error.message });
  }
}

export async function deleteProperty(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    // Note: owner validation is performed by ownerMiddleware
    if (checkMongoConnected()) {
      await Property.findByIdAndDelete(id);
      res.json({ message: "Property listings deleted successfully." });
    } else {
      const index = memoryStore.properties.findIndex((p) => p._id === id);
      if (index === -1) {
        res.status(404).json({ message: "Property not found." });
        return;
      }
      memoryStore.properties.splice(index, 1);
      res.json({ message: "Property listings deleted successfully." });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete property listing.", error: error.message });
  }
}

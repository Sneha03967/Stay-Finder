import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, memoryStore, IUserMemory } from "../models/User";
import { checkMongoConnected } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email and password are required fields." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const userRole = role && ["guest", "host", "admin"].includes(role) ? role : "guest";

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (checkMongoConnected()) {
      // 1. Mongoose Database Mode
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        res.status(400).json({ message: "This email address is already registered." });
        return;
      }

      const newUser = new User({
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
      });

      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
        },
        token,
      });
    } else {
      // 2. In-Memory Mock Mode
      const existingUser = memoryStore.users.find((u) => u.email === cleanEmail);
      if (existingUser) {
        res.status(400).json({ message: "This email address is already registered in local store." });
        return;
      }

      const memoryId = `user_${Date.now()}`;
      const newMemoryUser: IUserMemory = {
        _id: memoryId,
        name,
        email: cleanEmail,
        role: userRole,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.users.push(newMemoryUser);
      const token = jwt.sign({ id: memoryId, role: userRole }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        user: {
          id: memoryId,
          name,
          email: cleanEmail,
          role: userRole,
        },
        token,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to register user.", error: error.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required fields." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    if (checkMongoConnected()) {
      // 1. Mongoose Database Mode
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        res.status(404).json({ message: "No user found with this email." });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password credentials." });
        return;
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } else {
      // 2. In-Memory Mock Mode
      const user = memoryStore.users.find((u) => u.email === cleanEmail);
      if (!user) {
        res.status(404).json({ message: "No local user found with this email." });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password credentials." });
        return;
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to log in.", error: error.message });
  }
}

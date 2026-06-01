import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { connectDB, seedInMemoryStore } from "./server/db";

// Routes imports
import authRoutes from "./server/routes/auth.routes";
import propertyRoutes from "./server/routes/property.routes";
import bookingRoutes from "./server/routes/booking.routes";

async function startServer() {
  // Initialize DB Connection
  await connectDB();
  
  // Seed local fallback listings for preview
  seedInMemoryStore();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Basic Middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static serving for local uploads directory
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API Route mountings
  app.use("/api/auth", authRoutes);
  app.use("/api/properties", propertyRoutes);
  app.use("/api/bookings", bookingRoutes);

  // Simple health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Airbnb Clone API is healthy!" });
  });

  // Enable Vite middleware in non-production, otherwise serve built distribution files
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Express + Vite server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    console.log("Starting Express + Vite server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // Fallback all other routes to index.html for React SPA
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Full-stack application ready and running on: http://localhost:${PORT}`);
    console.log(`📂 Client frontpage & API endpoints unified on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot full-stack server on startup!", err);
});

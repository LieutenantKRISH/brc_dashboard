import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors";

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// CORS setup
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        process.env.FRONTEND_URL, // Your frontend domain from environment variable
        "https://brc-dashboard-frontend.onrender.com", // Example Render frontend URL
        "http://localhost:3000", // For local testing
        "http://localhost:5173",
        "https://brc-dashboard-1.onrender.com/" // Vite dev server
      ].filter(Boolean) // Remove undefined values
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "0.0.0.0"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads")); // uploaded files

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/admin", adminRoutes);

// Health check route (optional)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running!" });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

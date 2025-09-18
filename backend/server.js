import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();
const app = express();
connectDB();

// __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS setup
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["*"] // Allow all in production (frontend is served from same origin)
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

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

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  console.log("=== PRODUCTION MODE - FRONTEND SETUP ===");
  console.log("Current working directory:", process.cwd());
  console.log("Server file directory:", __dirname);
  
  // Try multiple possible paths for deployment
  const possiblePaths = [
    path.join(__dirname, "../frontend/dist"),           // Local development
    path.join(__dirname, "../../frontend/dist"),        // Render deployment
    path.join(__dirname, "../../../frontend/dist"),     // Alternative Render path
    path.join(process.cwd(), "frontend/dist"),          // Alternative deployment
    path.join(process.cwd(), "../frontend/dist"),       // Another alternative
    path.join(process.cwd(), "src/frontend/dist"),      // Render specific path
    path.join("/opt/render/project/src/frontend/dist"), // Exact Render path from error
    path.join("/opt/render/project/frontend/dist"),     // Alternative Render path
  ];
  
  console.log("Testing possible frontend paths:");
  let frontendPath = null;
  for (const testPath of possiblePaths) {
    try {
      const indexPath = path.join(testPath, "index.html");
      console.log(`Testing: ${testPath}`);
      console.log(`  Index file: ${indexPath}`);
      console.log(`  Exists: ${fs.existsSync(indexPath)}`);
      
      if (fs.existsSync(indexPath)) {
        frontendPath = testPath;
        console.log(`✅ FOUND FRONTEND AT: ${frontendPath}`);
        break;
      }
    } catch (err) {
      console.log(`  Error testing path: ${err.message}`);
    }
  }

  if (frontendPath) {
    console.log(`Serving static files from: ${frontendPath}`);
    // Serve static files
    app.use(express.static(frontendPath));

    // Fallback for all other routes
    app.get(/.*/, (req, res) => {
      console.log(`Serving index.html for route: ${req.path}`);
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    console.log("❌ FRONTEND BUILD NOT FOUND!");
    console.log("Available directories in current working directory:");
    try {
      const dirContents = fs.readdirSync(process.cwd());
      console.log(dirContents);
    } catch (err) {
      console.log("Could not read current directory:", err.message);
    }
    
    // Fallback route that provides helpful information
    app.get(/.*/, (req, res) => {
      // Serve a simple HTML page with debugging info
      const debugInfo = {
        error: "Frontend not found",
        message: "The frontend build files are missing. Please ensure the frontend is built before deployment.",
        paths: possiblePaths,
        currentDir: process.cwd(),
        serverDir: __dirname,
        timestamp: new Date().toISOString()
      };
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>BRC Dashboard - Deployment Issue</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
            .status { color: #1976d2; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 BRC Dashboard</h1>
            <div class="error">
              <h2>⚠️ Frontend Build Not Found</h2>
              <p>The frontend build files are missing. This usually means the build process didn't complete successfully during deployment.</p>
            </div>
            
            <div class="info">
              <h3>🔧 Debug Information</h3>
              <p><strong>Current Directory:</strong> ${debugInfo.currentDir}</p>
              <p><strong>Server Directory:</strong> ${debugInfo.serverDir}</p>
              <p><strong>Timestamp:</strong> ${debugInfo.timestamp}</p>
            </div>
            
            <div class="info">
              <h3>📁 Tested Paths</h3>
              <pre>${debugInfo.paths.map(p => `• ${p}`).join('\n')}</pre>
            </div>
            
            <div class="info">
              <h3>🛠️ Next Steps</h3>
              <ol>
                <li>Check the build logs in your deployment platform</li>
                <li>Ensure the frontend build command runs successfully</li>
                <li>Verify the build output is in the expected location</li>
                <li>Check that all dependencies are installed correctly</li>
              </ol>
            </div>
            
            <div class="status">
              <p>✅ Backend API is running correctly</p>
              <p>❌ Frontend build files are missing</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      res.status(404).send(html);
    });
  }
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

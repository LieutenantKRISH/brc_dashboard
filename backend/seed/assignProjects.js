import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brc-dashboard';

async function assignProjectsToUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");

    // Get all users and projects
    const users = await User.find({ role: "user" });
    const projects = await Project.find();

    console.log(`Found ${users.length} users and ${projects.length} projects`);

    if (users.length === 0 || projects.length === 0) {
      console.log("No users or projects found. Please seed users and projects first.");
      return;
    }

    // No project assignments initially - all projects remain unassigned
    console.log("No projects assigned to users initially. All projects remain unassigned.");
    
    // Ensure all projects have empty assignedTo arrays and default status
    for (const project of projects) {
      project.assignedTo = [];
      project.status = "open"; // Set all projects to open status initially
      await project.save();
      console.log(`Reset project "${project.projectName}" - no assignments, status: open`);
    }

    console.log("All project assignments completed successfully!");
    
  } catch (error) {
    console.error("Error assigning projects:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
  }
}

assignProjectsToUsers();

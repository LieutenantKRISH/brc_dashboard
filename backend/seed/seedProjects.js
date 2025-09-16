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

const sampleProjects = [
  {
    projectName: "Website Redesign",
    projectDescription: "Complete redesign of the company website with modern UI/UX",
    projectDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: "open",
    revenue: 15000,
    assignedTo: []
  },
  {
    projectName: "Mobile App Development",
    projectDescription: "Development of a cross-platform mobile application",
    projectDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    status: "open",
    revenue: 25000,
    assignedTo: []
  },
  {
    projectName: "Database Migration",
    projectDescription: "Migration from legacy database to modern cloud solution",
    projectDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    status: "open",
    revenue: 8000,
    assignedTo: []
  },
  {
    projectName: "E-commerce Platform",
    projectDescription: "Building a complete e-commerce solution with payment integration",
    projectDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    status: "open",
    revenue: 35000,
    assignedTo: []
  },
  {
    projectName: "API Integration",
    projectDescription: "Integrating third-party APIs for enhanced functionality",
    projectDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    status: "open",
    revenue: 5000,
    assignedTo: []
  }
];

async function seedProjects() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");

    // Clear existing projects
    await Project.deleteMany({});
    console.log("Cleared existing projects");

    // Create sample projects
    for (const projectData of sampleProjects) {
      const project = await Project.create(projectData);
      console.log(`Created project: ${project.projectName}`);
    }

    console.log("All projects seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding projects:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
  }
}

seedProjects();

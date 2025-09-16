
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

// Direct connection for seeding
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/brc-dashboard";
console.log("Connecting to MongoDB with URI:", MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function seed() {
  const email = "admin@example.com";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin exists");
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash("AdminPass123!", Number(process.env.BCRYPT_SALT) || 10);
  const admin = await User.create({ name: "Admin", email, passwordHash, role: "admin" });
  console.log("Admin created:", admin.email);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

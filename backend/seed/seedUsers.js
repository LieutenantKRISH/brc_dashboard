import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brc-dashboard';

// Users with simple ID structure starting from 0
const users = [
  { 
    _id: new mongoose.Types.ObjectId("000000000000000000000000"), 
    email: "kavitasarapali50@gmail.com", 
    name: "Kavita Sarapali", 
    role: "user" 
  },
  { 
    _id: new mongoose.Types.ObjectId("000000000000000000000001"), 
    email: "shruthirpm26@gmail.com", 
    name: "Shruthi RPM", 
    role: "user" 
  },
  { 
    _id: new mongoose.Types.ObjectId("000000000000000000000002"), 
    email: "sanathnayak733@gmail.com", 
    name: "Sanath Nayak", 
    role: "user" 
  },
  { 
    _id: new mongoose.Types.ObjectId("000000000000000000000003"), 
    email: "saraswathisutaclasses@gmail.com", 
    name: "Saraswathi Suta", 
    role: "user" 
  },
  { 
    _id: new mongoose.Types.ObjectId("000000000000000000000004"), 
    email: "spiritualyatras6@gmail.com", 
    name: "Spiritual Yatras", 
    role: "user" 
  },
  { 
    _id: new mongoose.Types.ObjectId("000000000000000000000005"), 
    email: "seemaf1504@gmail.com", 
    name: "Seema F", 
    role: "user" 
  },
  { 
    _id: new mongoose.Types.ObjectId("000000000000000000000006"), 
    email: "krishspider@gmail.com", 
    name: "Krish Spider", 
    role: "admin" 
  }
];

const PASSWORD = "brcadmin@2025";

async function seedUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");

    const salt = Number(process.env.BCRYPT_SALT) || 10;
    const passwordHash = await bcrypt.hash(PASSWORD, salt);

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating password...`);
        existingUser.passwordHash = passwordHash;
        existingUser.role = userData.role;
        existingUser.name = userData.name;
        await existingUser.save();
        console.log(`Updated user: ${userData.email} (${userData.role}) - ID: ${existingUser._id}`);
      } else {
        const user = await User.create({
          _id: userData._id, // Use predefined ObjectId
          name: userData.name,
          email: userData.email,
          passwordHash: passwordHash,
          role: userData.role
        });
        console.log(`Created user: ${user.email} (${user.role}) - ID: ${user._id}`);
      }
    }

    console.log("All users seeded successfully!");
    console.log(`Password for all users: ${PASSWORD}`);
    
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
  }
}

seedUsers();

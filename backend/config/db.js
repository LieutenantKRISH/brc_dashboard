import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

export default function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/brc-dashboard";
  console.log("Connecting to MongoDB with URI:", uri);
  mongoose.connect(uri)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}

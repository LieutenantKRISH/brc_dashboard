import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Allowed emails for the system
const ALLOWED_EMAILS = [
  "kavitasarapali50@gmail.com",
  "shruthirpm26@gmail.com", 
  "sanathnayak733@gmail.com",
  "saraswathisutaclasses@gmail.com",
  "spiritualyatras6@gmail.com",
  "seemaf1504@gmail.com",
  "krishspider@gmail.com"
];

export async function register(req, res) {
  // Registration is disabled - only specific emails are allowed
  return res.status(403).json({ 
    message: "Registration is not available. Access is limited to authorized users only." 
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  
  // Check if email is in allowed list
  if (!ALLOWED_EMAILS.includes(email)) {
    return res.status(401).json({ 
      message: "Access denied. This email is not authorized to use the system." 
    });
  }
  
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "your-secret-key-here", { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
}

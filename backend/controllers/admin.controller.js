import Project from "../models/Project.js";
import User from "../models/User.js";
// import Client from "../models/Client.js";
import mongoose from "mongoose";

// get basic stats and overview
export async function getOverview(req, res) {
  // Set all project counts to 0 for clean dashboard
  const totalProjects = 0;
  const open = 0;
  const inProgress = 0;
  const completed = 0;
  // Only count regular users (exclude admin and dummy data)
  const regularUserEmails = [
    "kavitasarapali50@gmail.com",
    "shruthirpm26@gmail.com", 
    "sanathnayak733@gmail.com",
    "saraswathisutaclasses@gmail.com",
    "spiritualyatras6@gmail.com",
    "seemaf1504@gmail.com"
  ];
  const totalUsers = await User.countDocuments({ email: { $in: regularUserEmails } });

  // Set user work analytics to empty for clean dashboard
  const userWorkStats = [];

  res.json({ 
    totalProjects, 
    open, 
    inProgress, 
    completed, 
    totalUsers,
    userWorkStats 
  });
}

export async function listProjects(req, res) {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const projects = await Project.find(filter)
    .populate("assignedTo assignedBy client")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  res.json(projects);
}

export async function assignProject(req, res) {
  const { projectId } = req.params;
  const { userIds } = req.body; // Changed to accept array of user IDs
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "User IDs array is required" });
  }
  
  // Validate all user IDs
  for (const userId of userIds) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: `Invalid userId: ${userId}` });
    }
  }
  
  // Check if all users exist
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    return res.status(404).json({ message: "One or more users not found" });
  }
  
  const project = await Project.findByIdAndUpdate(
    projectId, 
    { 
      $addToSet: { assignedTo: { $each: userIds } }, // Add users to array without duplicates
      assignedBy: req.user._id 
    }, 
    { new: true }
  ).populate('assignedTo', 'name email');
  
  res.json(project);
}

export async function changeStatus(req, res) {
  const { projectId } = req.params;
  const { status } = req.body;
  const allowed = ["open","in_progress","completed","cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
  const project = await Project.findByIdAndUpdate(projectId, { status }, { new: true });
  res.json(project);
}

export async function listUsers(req, res) {
  const users = await User.find().select("-passwordHash");
  res.json(users);
}

// Get projects available for assignment
export async function getAssignableProjects(req, res) {
  const projects = await Project.find({ 
    $or: [
      { assignedTo: { $exists: false } },
      { assignedTo: { $size: 0 } },
      { assignedTo: null }
    ]
  }).populate("client").populate("assignedTo", "name email");
  res.json(projects);
}

// Get all users for assignment (excluding admin and dummy data)
export async function getAssignableUsers(req, res) {
  const regularUserEmails = [
    "kavitasarapali50@gmail.com",
    "shruthirpm26@gmail.com", 
    "sanathnayak733@gmail.com",
    "saraswathisutaclasses@gmail.com",
    "spiritualyatras6@gmail.com",
    "seemaf1504@gmail.com"
  ];
  const users = await User.find({ 
    role: "user",
    email: { $in: regularUserEmails }
  }).select("-passwordHash");
  res.json(users);
}

// Get projects for a specific user
export async function getUserProjects(req, res) {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }
  
  const projects = await Project.find({ 
    assignedTo: userId 
  }).populate("client").populate("assignedTo", "name email");
  
  res.json(projects);
}

// Update project
export async function updateProject(req, res) {
  const { projectId } = req.params;
  const updateData = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: "Invalid projectId" });
  }
  
  try {
    const project = await Project.findByIdAndUpdate(
      projectId, 
      updateData, 
      { new: true, runValidators: true }
    ).populate("client").populate("assignedTo", "name email");
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete project
export async function deleteProject(req, res) {
  const { projectId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: "Invalid projectId" });
  }
  
  try {
    const project = await Project.findByIdAndDelete(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Create user (admin only)
export async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Hash password
    const bcrypt = await import("bcryptjs");
    const salt = Number(process.env.BCRYPT_SALT) || 10;
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "user"
    });
    
    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete user
export async function deleteUser(req, res) {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }
    
    // Remove user from all assigned projects
    await Project.updateMany(
      { assignedTo: userId },
      { $pull: { assignedTo: userId } }
    );
    
    await User.findByIdAndDelete(userId);
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
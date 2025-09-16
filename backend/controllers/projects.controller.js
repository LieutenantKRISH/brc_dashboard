import Project from "../models/Project.js";
import Client from "../models/Clients.js";
// import User from "../User.js";

// Create project (user or admin)
export async function createProject(req, res) {
  const payload = req.body;
  // if client object present create client
  let clientRef = null;
  if (payload.client) {
    const client = await Client.create(payload.client);
    clientRef = client._id;
  }
  const project = await Project.create({
    ...payload,
    client: clientRef,
    assignedBy: req.user._id
  });
  res.status(201).json(project);
}

export async function getUserProjects(req, res) {
  const projects = await Project.find({ 
    $or: [
      { assignedTo: req.user._id }, // User is assigned to project
      { assignedBy: req.user._id }, // User created the project
      { "client.email": req.user.email } // User is the client
    ] 
  })
    .populate("assignedTo assignedBy client");
  res.json(projects);
}

export async function getProjectById(req, res) {
  const project = await Project.findById(req.params.id).populate("assignedTo assignedBy client");
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
}

export async function uploadAttachment(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  // multer stored files on req.file or req.files
  const file = req.file;
  project.attachments.push({
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`
  });
  await project.save();
  res.json({ message: "Uploaded", attachment: project.attachments.at(-1) });
}

export async function addMeetingLink(req, res) {
  const { meetingLink } = req.body;
  const project = await Project.findByIdAndUpdate(req.params.id, { meetingLink }, { new: true });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
}

export async function updateProject(req, res) {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Project not found" });
  res.json(updated);
}

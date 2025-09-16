import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  url: String, // local path or S3 link
  uploadedAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectDeadline: { type: Date },
  revenue: { type: Number, default: 0 },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Changed to array for multiple users
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  remark: String,
  attachments: [AttachmentSchema],
  meetingLink: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  status: { type: String, enum: ["open","in_progress","completed","cancelled"], default: "open" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Project", ProjectSchema);

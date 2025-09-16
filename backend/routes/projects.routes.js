import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createProject, getUserProjects, getProjectById, uploadAttachment, addMeetingLink, updateProject } from "../controllers/projects.controller.js";
import { upload } from "../utils/upload.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createProject); // create project
router.get("/", getUserProjects); // list projects for user (assignedTo/assignedBy)
router.get("/:id", getProjectById);

router.patch("/:id", updateProject);

router.post("/:id/attachment", upload.single("file"), uploadAttachment);
router.post("/:id/meeting", addMeetingLink);

export default router;

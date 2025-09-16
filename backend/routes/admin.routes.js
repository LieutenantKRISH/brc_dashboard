import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { getOverview, listProjects, assignProject, changeStatus, listUsers, getAssignableProjects, getAssignableUsers, getUserProjects, updateProject, deleteProject, createUser, deleteUser } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("admin"));

router.get("/overview", getOverview);
router.get("/projects", listProjects); // query: page, limit, status
router.get("/projects/assignable", getAssignableProjects);
router.get("/users/assignable", getAssignableUsers);
router.get("/users/:userId/projects", getUserProjects);
router.post("/projects/:projectId/assign", assignProject);
router.patch("/projects/:projectId/status", changeStatus);
router.put("/projects/:projectId", updateProject);
router.delete("/projects/:projectId", deleteProject);
router.get("/users", listUsers);
router.post("/users", createUser);
router.delete("/users/:userId", deleteUser);

export default router;

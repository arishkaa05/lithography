import { Router } from "express";
const userProjectController = require("../controller/userProjectController");

export const userProjectRouter = Router();

userProjectRouter.get("/get_project_by_id/:id", userProjectController.getProjectByUserId);
userProjectRouter.post("/create", userProjectController.createUserProject);

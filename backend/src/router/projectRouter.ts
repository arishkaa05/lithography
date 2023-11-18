import { Router } from "express";
const projectController = require("../controller/projectController");

export const projectRouter = Router();

projectRouter.get("/all", projectController.getAll);
projectRouter.post("/create", projectController.createProject);

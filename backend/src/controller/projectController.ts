import { Request, Response, NextFunction } from "express";
import Project from "../models/projectModel";
const ApiError = require("../error");

interface ProjectDto {
  name: string;
  data: string;
}

class ProjectController {
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectInfo = req.body;
      console.log(projectInfo);

      const project = await Project.create({
        ...(projectInfo as ProjectDto),
      });

      return res.status(200).json({
        project: project.id,
      });
    } catch (e) {
      return next(ApiError.badRequest("Ошибка при создании!"));
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await Project.findAll();

      return res.status(200).json({
        projects: projects,
      });
    } catch (e) {
      return next(ApiError.badRequest("Ошибка при получении!"));
    }
  }
}

module.exports = new ProjectController();

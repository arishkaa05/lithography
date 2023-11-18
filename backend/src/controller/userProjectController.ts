import { Request, Response, NextFunction } from "express";
import UserProject from "../models/userProjectModel";
import User from "../models/userModel";
import Project from "../models/projectModel";
const ApiError = require("../error");

interface UserProjectDto {
  userId: number;
  projectId: number;
}

class UserProjectController {
  async createUserProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userProjectInfo = req.body;
      console.log(userProjectInfo);

      const userProject = await UserProject.create({
        ...(userProjectInfo as UserProjectDto),
      });

      return res.status(200).json({
        userProjectId: userProject.id,
      });
    } catch (e) {
      return next(ApiError.badRequest("Ошибка при создании связи!"));
    }
  }

  async getProjectByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      console.log(userId);
      const projects = await Project.findAll({
        include: {
          model: User,
          where: {
            id: userId,
          },
          through: {
            attributes: [],
          },
        },
      });
      return res.status(200).json({
        projects,
      });
    } catch (error) {
      return next(ApiError.badRequest("Ошибка при получении!"));
    }
  }
}

module.exports = new UserProjectController();

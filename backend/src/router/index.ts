import { Router } from "express";
import { userRouter } from "./userRouter";
import { projectRouter } from './projectRouter';
import { userProjectRouter } from "./userProjectRouter";

export const defaultRouter = Router();

defaultRouter.use("/user", userRouter);
defaultRouter.use("/project", projectRouter);
defaultRouter.use("/user_project", userProjectRouter);

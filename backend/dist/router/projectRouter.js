"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
const express_1 = require("express");
const projectController = require("../controller/projectController");
exports.projectRouter = (0, express_1.Router)();
exports.projectRouter.get("/all", projectController.getAll);
exports.projectRouter.post("/create", projectController.createProject);

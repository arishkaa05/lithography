"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userProjectRouter = void 0;
const express_1 = require("express");
const userProjectController = require("../controller/userProjectController");
exports.userProjectRouter = (0, express_1.Router)();
exports.userProjectRouter.get("/get_project_by_id/:id", userProjectController.getProjectByUserId);
exports.userProjectRouter.post("/create", userProjectController.createUserProject);

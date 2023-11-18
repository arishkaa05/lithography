"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const projectModel_1 = __importDefault(require("../models/projectModel"));
const ApiError = require("../error");
class ProjectController {
    createProject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectInfo = req.body;
                console.log(projectInfo);
                const project = yield projectModel_1.default.create(Object.assign({}, projectInfo));
                return res.status(200).json({
                    project: project.id,
                });
            }
            catch (e) {
                return next(ApiError.badRequest("Ошибка при создании!"));
            }
        });
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projects = yield projectModel_1.default.findAll();
                return res.status(200).json({
                    projects: projects,
                });
            }
            catch (e) {
                return next(ApiError.badRequest("Ошибка при получении!"));
            }
        });
    }
}
module.exports = new ProjectController();

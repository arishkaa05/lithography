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
const userProjectModel_1 = __importDefault(require("../models/userProjectModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const projectModel_1 = __importDefault(require("../models/projectModel"));
const ApiError = require("../error");
class UserProjectController {
    createUserProject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userProjectInfo = req.body;
                console.log(userProjectInfo);
                const userProject = yield userProjectModel_1.default.create(Object.assign({}, userProjectInfo));
                return res.status(200).json({
                    userProjectId: userProject.id,
                });
            }
            catch (e) {
                return next(ApiError.badRequest("Ошибка при создании связи!"));
            }
        });
    }
    getProjectByUserId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                console.log(userId);
                const projects = yield projectModel_1.default.findAll({
                    include: {
                        model: userModel_1.default,
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
            }
            catch (error) {
                return next(ApiError.badRequest("Ошибка при получении!"));
            }
        });
    }
}
module.exports = new UserProjectController();

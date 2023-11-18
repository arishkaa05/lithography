"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const projectModel_1 = __importDefault(require("./projectModel"));
const userModel_1 = __importDefault(require("./userModel"));
const sequelize = require("../db");
const { DataTypes } = require("sequelize");
// Связывающая таблица
const UserProject = sequelize.define("user_project", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});
// Отношение пользователя и роли
userModel_1.default.belongsToMany(projectModel_1.default, { through: UserProject });
projectModel_1.default.belongsToMany(userModel_1.default, { through: UserProject });
exports.default = UserProject;

import Project from "./projectModel";
import User from "./userModel";

const sequelize = require("../db");
const { DataTypes } = require("sequelize");

// Связывающая таблица
const UserProject = sequelize.define("user_project", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});


// Отношение пользователя и роли
User.belongsToMany(Project, { through: UserProject });
Project.belongsToMany(User, { through: UserProject });


export default UserProject;
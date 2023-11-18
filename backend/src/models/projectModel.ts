const sequelize = require("../db");
const { DataTypes } = require("sequelize");

// Симптом
const Project = sequelize.define("project", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  data: { type: DataTypes.STRING, allowNull: false },
});

export default Project;
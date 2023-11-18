const sequelize = require("../db");
const { DataTypes } = require("sequelize");

// Пользователь
const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: false },
  fathername: { type: DataTypes.STRING, allowNull: true },
});

export default User;
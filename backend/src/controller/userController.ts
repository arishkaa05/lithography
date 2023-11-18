import { Request, Response, NextFunction } from "express";
const ApiError = require("../error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { serialize } from "cookie";
import User from "../models/userModel";

interface LoginDto {
  username: string;
  password: string;
}

interface UserDto extends LoginDto {
  name: string;
  lastname: string;
  fathername?: string;
  role?: string;
}

const generateJwt = (username: string, role: string, name?: string, lastname?: string) => {
  return jwt.sign(
    {
      username,
      role,
      name,
      lastname,
    },
    process.env.SECRET_KEY,
    { expiresIn: "730h" }
  );
};

class UserController {
  async ping(req: Request, res: Response) {
    return res.status(200).json("pong");
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userInfo = req.body;

      console.log(userInfo);

      const candidate = await User.findOne({ where: { username: userInfo.username } });

      if (candidate) return next(ApiError.badRequest("Пользователь с таким именем уже существует!"));

      const hashPassword = await bcrypt.hash(userInfo.password, 5);

      const user = await User.create({
        ...(userInfo as UserDto),
        password: hashPassword,
      });

      return res.status(200).json({
        username: user.username,
        role: user.role,
      });
    } catch (e) {
      return next(ApiError.badRequest("Ошибка при создании пользователя!"));
    }
  }
  
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username }, include: { all: true } });
      if (!user) return next(ApiError.internal("Пользователь не найден!"));

      let comparePassword = bcrypt.compareSync(password, user.password);

      if (!comparePassword) return next(ApiError.internal("Указан неверный пароль!"));

      const token = generateJwt(user.username, user.role, user?.name, user?.lastname);
      const serialized = serialize("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 24 * 30,
      });
      res.setHeader("Set-Cookie", serialized);

      return res.status(200).json({
        jwt: token,
        username: user.username,
        role: user.role,
        name: user.name || "",
        lastname: user.lastname || "",
      });
    } catch (e) {
      return next(ApiError.unauthorized("Ошибка при входе в систему!"));
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.cookies["jwt"]);
      const serialized = serialize("jwt", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: -1,
      });
      res.setHeader("Set-Cookie", serialized);
      return res.status(200).json("logout");
    } catch (e) {
      return next(ApiError.unauthorized("Ошибка при выходе из системы!"));
    }
  }

  async isAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.jwt;
      if (!token) return next(ApiError.unauthorized("Пользователь не авторизован, войдите в систему!"));
      const userInfo = jwt.verify(token, process.env.SECRET_KEY);

      let user = await User.findOne({ where: { username: userInfo.username } });
      if (!user) return next(ApiError.unauthorized("Пользователь не авторизован, войдите в систему!"));

      return res.status(200).json(userInfo);
    } catch (e) {
      return next(ApiError.unauthorized("Пользователь не авторизован!"));
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.findAll({ where: {} });
      return res.status(200).json(users);
    } catch (e) {
      return next(ApiError.badRequest("Ошибка"));
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      let { id, name, lastname, role, username } = req.body;
      let updates: any = {};
      let oldUser = await User.findOne({ where: { id } });

      if (oldUser.name !== name) updates.name = name;
      if (oldUser.username !== username) updates.username = username;
      if (oldUser.lastname !== lastname) updates.lastname = lastname;
      if (oldUser.role !== role) updates.role = role;

      let result = await oldUser.update(updates);
      return res.status(200).json(result);
    } catch (e) {
      return next(ApiError.unauthorized("Ошибка при изменении пользователя!"));
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.body;
      let result = await User.destroy({ where: { id } });
      return res.status(200).json(result);
    } catch (e) {
      return next(ApiError.unauthorized("Ошибка при удалении пользователя!"));
    }
  }
}

module.exports = new UserController();

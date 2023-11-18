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
const ApiError = require("../error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie_1 = require("cookie");
const userModel_1 = __importDefault(require("../models/userModel"));
const generateJwt = (username, role, name, lastname) => {
    return jwt.sign({
        username,
        role,
        name,
        lastname,
    }, process.env.SECRET_KEY, { expiresIn: "730h" });
};
class UserController {
    ping(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return res.status(200).json("pong");
        });
    }
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userInfo = req.body;
                console.log(userInfo);
                const candidate = yield userModel_1.default.findOne({ where: { username: userInfo.username } });
                if (candidate)
                    return next(ApiError.badRequest("Пользователь с таким именем уже существует!"));
                const hashPassword = yield bcrypt.hash(userInfo.password, 5);
                const user = yield userModel_1.default.create(Object.assign(Object.assign({}, userInfo), { password: hashPassword }));
                return res.status(200).json({
                    username: user.username,
                    role: user.role,
                });
            }
            catch (e) {
                return next(ApiError.badRequest("Ошибка при создании пользователя!"));
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = req.body;
                const user = yield userModel_1.default.findOne({ where: { username }, include: { all: true } });
                if (!user)
                    return next(ApiError.internal("Пользователь не найден!"));
                let comparePassword = bcrypt.compareSync(password, user.password);
                if (!comparePassword)
                    return next(ApiError.internal("Указан неверный пароль!"));
                const token = generateJwt(user.username, user.role, user === null || user === void 0 ? void 0 : user.name, user === null || user === void 0 ? void 0 : user.lastname);
                const serialized = (0, cookie_1.serialize)("jwt", token, {
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
            }
            catch (e) {
                return next(ApiError.unauthorized("Ошибка при входе в систему!"));
            }
        });
    }
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.cookies["jwt"]);
                const serialized = (0, cookie_1.serialize)("jwt", "", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: -1,
                });
                res.setHeader("Set-Cookie", serialized);
                return res.status(200).json("logout");
            }
            catch (e) {
                return next(ApiError.unauthorized("Ошибка при выходе из системы!"));
            }
        });
    }
    isAuth(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt;
                if (!token)
                    return next(ApiError.unauthorized("Пользователь не авторизован, войдите в систему!"));
                const userInfo = jwt.verify(token, process.env.SECRET_KEY);
                let user = yield userModel_1.default.findOne({ where: { username: userInfo.username } });
                if (!user)
                    return next(ApiError.unauthorized("Пользователь не авторизован, войдите в систему!"));
                return res.status(200).json(userInfo);
            }
            catch (e) {
                return next(ApiError.unauthorized("Пользователь не авторизован!"));
            }
        });
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_1.default.findAll({ where: {} });
                return res.status(200).json(users);
            }
            catch (e) {
                return next(ApiError.badRequest("Ошибка"));
            }
        });
    }
    updateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, name, lastname, role, username } = req.body;
                let updates = {};
                let oldUser = yield userModel_1.default.findOne({ where: { id } });
                if (oldUser.name !== name)
                    updates.name = name;
                if (oldUser.username !== username)
                    updates.username = username;
                if (oldUser.lastname !== lastname)
                    updates.lastname = lastname;
                if (oldUser.role !== role)
                    updates.role = role;
                let result = yield oldUser.update(updates);
                return res.status(200).json(result);
            }
            catch (e) {
                return next(ApiError.unauthorized("Ошибка при изменении пользователя!"));
            }
        });
    }
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id } = req.body;
                let result = yield userModel_1.default.destroy({ where: { id } });
                return res.status(200).json(result);
            }
            catch (e) {
                return next(ApiError.unauthorized("Ошибка при удалении пользователя!"));
            }
        });
    }
}
module.exports = new UserController();

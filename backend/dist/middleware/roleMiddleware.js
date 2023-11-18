"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRole = void 0;
const jwt = require('jsonwebtoken');
const ApiError = require('../error');
function isRole(roles) {
    return function (req, res, next) {
        var _a;
        try {
            const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt;
            if (!token)
                return next(ApiError.unauthorized('Пользователь не авторизован, войдите в систему!'));
            const userInfo = jwt.verify(token, process.env.SECRET_KEY);
            if (!roles.includes(userInfo.role))
                return next(ApiError.forbidden('У пользователя нет доступа к данному действию'));
            next();
        }
        catch (e) {
            return next(ApiError.unauthorized('Пользователь не авторизован!'));
        }
    };
}
exports.isRole = isRole;

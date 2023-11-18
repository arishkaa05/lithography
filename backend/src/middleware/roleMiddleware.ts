import {NextFunction, Request, Response} from "express";
import {ROLES} from "../types";
const jwt = require('jsonwebtoken')
const ApiError = require('../error');

export function isRole(roles: Array<ROLES>) {
    return function(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.jwt

            if (!token)
                return next(ApiError.unauthorized('Пользователь не авторизован, войдите в систему!'))

            const userInfo = jwt.verify(token, process.env.SECRET_KEY)

            if (!roles.includes(userInfo.role))
                return next(ApiError.forbidden('У пользователя нет доступа к данному действию'))

            next()
        } catch (e) {
            return next(ApiError.unauthorized('Пользователь не авторизован!'))
        }
    }
}
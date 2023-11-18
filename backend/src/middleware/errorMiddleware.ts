import {NextFunction, Request, Response} from "express";

const ApiError = require('../error')

module.exports = function (err: any, req: Request, res: Response, next: NextFunction) {
    return (err instanceof ApiError)
        ? res.status(err.status).json({message: err.message})
        : res.status(500).json({message: 'Непредвиденная ошибка!'})
}
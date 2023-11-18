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
require('dotenv').config();
const router_1 = require("./router");
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const PORT = process.env.PORT;
const sequelize = require('./db');
const errorHandler = require('./middleware/errorMiddleware');
const path = require('path');
const fileUpload = require('express-fileupload');
const cookieParser = require("cookie-parser");
const cors = require('cors');
function loggerMiddleware(request, response, next) {
    console.log(`${request.method} ${request.path}`);
    next();
}
const app = (0, express_1.default)();
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'https://769b-83-68-50-244.eu.ngrok.io', 'https://292b-83-68-51-186.eu.ngrok.io'],
    credentials: true
}));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(body_parser_1.default.json());
app.use(loggerMiddleware);
app.use('/media', express_1.default.static(path.join(__dirname, 'static')));
app.use('/pdf', express_1.default.static(path.join(__dirname, 'pdf')));
app.use('/api', router_1.defaultRouter);
app.use(errorHandler);
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sequelize.authenticate();
            yield sequelize.sync();
            console.log('Connected console to the database and synchronized successfully.');
            app.listen(PORT, () => console.log(`Started on port ${PORT}`));
        }
        catch (e) {
            console.log(e);
        }
    });
}
start();

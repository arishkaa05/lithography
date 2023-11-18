require('dotenv').config()
import {defaultRouter} from "./router"
import bodyParser from "body-parser";
import express from 'express'


const PORT = process.env.PORT
const sequelize = require('./db')
const errorHandler = require('./middleware/errorMiddleware')
const path = require('path')
const fileUpload = require('express-fileupload')
const cookieParser = require("cookie-parser");
const cors = require('cors')

function loggerMiddleware(request: express.Request, response: express.Response, next: any) {
    console.log(`${request.method} ${request.path}`);
    next();
}

const app = express();
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'https://769b-83-68-50-244.eu.ngrok.io', 'https://292b-83-68-51-186.eu.ngrok.io'],
    credentials: true
}))
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(bodyParser.json())
app.use(loggerMiddleware);
app.use('/media', express.static(path.join(__dirname, 'static')))
app.use('/pdf', express.static(path.join(__dirname, 'pdf')))
app.use('/api', defaultRouter);
app.use(errorHandler);

async function start() {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        console.log('Connected console to the database and synchronized successfully.');
        app.listen(PORT, () => console.log(`Started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()
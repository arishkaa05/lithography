import { Router } from 'express';
const userController = require('../controller/userController')

export const userRouter = Router()

userRouter.get('/', userController.ping);
userRouter.get('/all', userController.getAll);
userRouter.get('/logout', userController.logout);
userRouter.get('/check', userController.isAuth);
userRouter.post('/update', userController.updateUser);
userRouter.post('/create', userController.createUser);
userRouter.post('/login', userController.login);
userRouter.post('/delete', userController.deleteUser);


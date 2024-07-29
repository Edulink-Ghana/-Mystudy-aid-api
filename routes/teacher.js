import { login, registerTeacher, token, profile, logout } from "../Controllers/teacherController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { Router } from "express";


export const teacherRouter = Router();

teacherRouter.post('/users/registers',registerTeacher)
teacherRouter.post('/users/auth/session/login',login)
teacherRouter.post('/users/auth/token/login',token)
teacherRouter.get('/users/profile',isAuthenticated,profile)
teacherRouter.post('/users/logout',isAuthenticated,logout)

 //export default teacherRouter

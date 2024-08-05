import { login, registerTeacher, token, profile, logout } from "../Controllers/teacherController.js";
import { isAuthenticated, isAuthenticatedteacher } from "../middlewares/auth.js";
import { Router } from "express";


export const teacherRouter = Router();

teacherRouter.post('/teacher/register',registerTeacher)
teacherRouter.post('/teacher/session/login',login)
teacherRouter.post('/teacher/token/login',token)
teacherRouter.get('/teacher/profile',isAuthenticatedteacher,profile)
teacherRouter.post('/teacher/logout',isAuthenticatedteacher,logout)

 //export default teacherRouter

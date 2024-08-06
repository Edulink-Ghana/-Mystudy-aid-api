import { login, registerTeacher, token, profile, logout } from "../Controllers/teacherController.js";
import { isAuthenticated, isAuthenticatedteacher } from "../middlewares/auth.js";
import { Router } from "express";


export const teacherRouter = Router();

teacherRouter.post('/teachers/registers',registerTeacher)
teacherRouter.post('/teachers/session/login',login)
teacherRouter.post('/teachers/token/login',token)
teacherRouter.get('/teachers/profile',isAuthenticatedteacher,profile)
teacherRouter.post('/teachers/logout',isAuthenticatedteacher,logout)

 //export default teacherRouter

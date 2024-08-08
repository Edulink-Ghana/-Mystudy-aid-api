import { login, registerTeacher, token, profile, logout,getTeachers, searchTeachers, updateTeacher } from "../Controllers/teacherController.js";
import {  isAuthenticated, isAuthenticatedteacher, isAuthorized } from "../middlewares/auth.js";
import { Router } from "express";


export const teacherRouter = Router();


teacherRouter.post('/teachers/register',registerTeacher)

teacherRouter.post('/teachers/session/login',login)

teacherRouter.post('/teachers/token/login',token)

teacherRouter.get('/teachers/search', searchTeachers);

teacherRouter.get('/teachers',isAuthenticatedteacher, getTeachers);

teacherRouter.patch('/teachers/:id', isAuthenticatedteacher,updateTeacher);

teacherRouter.get('/teachers/profile',isAuthenticatedteacher,profile)

teacherRouter.post('/teachers/logout',isAuthenticatedteacher,logout)



 //export default teacherRouter

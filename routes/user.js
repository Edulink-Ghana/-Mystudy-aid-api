import { login, register, token, profile, logout, updateUser } from "../Controllers/usercontroller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { Router } from "express";


const userRouter = Router();

userRouter.post('/users/register',register)

userRouter.post('/users/auth/session/login',login)

userRouter.post('/users/auth/token/login',token)

userRouter.get('/users/profile',isAuthenticated,profile)

userRouter.post('/users/logout',isAuthenticated,logout)

userRouter.patch('/users/:id',isAuthenticated,updateUser)


export default userRouter;
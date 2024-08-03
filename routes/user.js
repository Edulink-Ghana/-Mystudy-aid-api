import { login, register, token, profile, logout, updateUser,getUsers,createUser } from "../Controllers/usercontroller.js";
import { isAuthenticated,isAuthorized } from "../middlewares/auth.js";
import { Router } from "express";


const userRouter = Router();

userRouter.post('/users/register',register)

userRouter.post('/users/session/login',login)

userRouter.post('/users/token/login',token)

userRouter.get('/users/profile',isAuthenticated,profile)

userRouter.get('/users',isAuthenticated, isAuthorized('read_users'),getUsers)

userRouter.post('/users/create',isAuthenticated,isAuthorized('create_user'),createUser)

userRouter.post('/users/logout',isAuthenticated,logout)

userRouter.patch('/users/:id',isAuthenticated,isAuthorized('update_user'),updateUser)


export default userRouter;
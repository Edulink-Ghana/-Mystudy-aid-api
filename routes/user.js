import { login, register, token, profile, logout, updateUser, getUsers, createUser, forgotPassword, verifyResetToken, resetPassword, getUserBookings, verifyEmail, createReview } from "../Controllers/usercontroller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import { Router } from "express";


const userRouter = Router();

userRouter.post('/users/register', register)

userRouter.post('/users/session/login', login)

userRouter.post('/users/token/login', token)

userRouter.get('/users/profile', isAuthenticated, profile)

userRouter.get('/users/bookings', isAuthenticated, getUserBookings);

userRouter.post('/users/logout', isAuthenticated, logout)

userRouter.post('/users/review/:id',isAuthenticated,createReview)

userRouter.post('/users/forgot-password', forgotPassword)

userRouter.get('/users/reset-token/:id', verifyResetToken)

userRouter.post('/users/reset-password', resetPassword)

userRouter.get('/users/verify-email/:id', verifyEmail)


userRouter.get('/users', isAuthenticated, isAuthorized('read_users'), getUsers)

userRouter.post('/users/create', isAuthenticated, isAuthorized('create_user'), createUser)

userRouter.patch('/users/:id', isAuthenticated, isAuthorized('update_user'), updateUser)


export default userRouter;
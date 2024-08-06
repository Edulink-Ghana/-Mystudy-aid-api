import { Router } from "express";
import { createBooking } from "../Controllers/booking controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

export const bookingRouter = Router();

bookingRouter.post('/bookings/create',isAuthenticated,createBooking)



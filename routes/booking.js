import { Router } from "express";
import { createBooking, getAllBookings, updateBookingStatus, deleteBooking, getBookingById } from "../Controllers/booking controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { isAuthorized } from "../middlewares/auth.js";

export const bookingRouter = Router();

bookingRouter.post('/bookings/create',isAuthenticated,isAuthorized('create_booking'), createBooking);

bookingRouter.get('/bookings',isAuthenticated, isAuthorized('read_bookings'),getAllBookings);

bookingRouter.get('/bookings/:id', isAuthenticated, isAuthorized('read_booking'), getBookingById);

bookingRouter.patch('/bookings/:id', isAuthenticated, isAuthorized('update_booking'), updateBookingStatus);

bookingRouter.delete('/bookings/:id', isAuthenticated, isAuthorized('delete_booking'), deleteBooking);



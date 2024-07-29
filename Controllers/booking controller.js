import { Booking } from "../models/bookingModel.js";
import { Teacher } from "../models/teacherModel.js";
import { User } from "../models/userModel.js";

// create booking
export const createBooking = async (req, res, next) => { try {
   const userId = req.session?.user?.id || req?.user?.id;

   const user = await User.findById(userId);
   if (!user) {
     return res.status(404).send({ error: 'User not found' });
   }
   const booking = await Booking.create({
    ...value,
    user:userId,
    teacher:,
   })
} catch (error) {
    
}}
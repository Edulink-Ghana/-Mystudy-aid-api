import { Booking } from "../models/bookingModel.js";
import { Teacher } from "../models/teacherModel.js";
import { User } from "../models/userModel.js";
import { bookingValidator } from "../validators/booking.js";

// create booking
export const createBooking = async (req, res, next) => {
  try {
    // Validate request
    const { value, error } = bookingValidator.validate(req.body);
    if (error) {
      return res.status(422).json(error.details[0].message);
    }
    //Get User from Session/token
    const userId = req.session?.user?.id || req?.user?.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const teacherId = value.teacher;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).send({ error: 'Teacher not found' });
    }

    const booking = await Booking.create({
      ...value,
      user: userId,
      teacher: teacherId,
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    next(error);
  }
};
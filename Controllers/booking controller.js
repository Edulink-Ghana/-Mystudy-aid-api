import { Booking } from "../models/bookingModel.js";
import { Teacher } from "../models/teacherModel.js";
import { User } from "../models/userModel.js";
import { bookingValidator, updateBookingValidator } from "../validators/booking.js";

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

    user.bookings.push(booking._id);
    await user.save();
    teacher.bookings.push(booking._id);
    await teacher.save();

    res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    next(error);
  }
};


//Get All Bookings
export const getAllBookings = async (req, res, next) => {
  try {
    // Get query params (optional for filtering)
    const { filter = "{}" } = req.query;

    // Get all bookings (with optional filtering)
    const allBookings = await Booking.find(JSON.parse(filter))
      .populate({
        path: 'user',
        select: 'firstName lastName userName email', // Select user fields
      })
      .populate({
        path: 'teacher',
        select: 'firstName lastName userName email', // Select teacher fields
      });

    // Return response
    res.status(200).json(allBookings);
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    // Get booking ID from URL parameter
    const bookingId = req.params.id;

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'user',
        select: 'firstName lastName userName email', // Select user fields
      })
      .populate({
        path: 'teacher',
        select: 'firstName lastName userName email', // Select teacher fields
      });

    if (!booking) {
      return res.status(404).send({ error: 'Booking not found' });
    }

    // Return response
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};


// Update booking status
export const updateBookingStatus = async (req, res, next) => {
  try {
    // Validate request
    const { value, error } = updateBookingValidator.validate(req.body);
    if (error) {
      return res.status(422).json(error.details[0].message);
    }

    // Get booking ID from URL parameter
    const bookingId = req.params.id;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).send({ error: 'Booking not found' });
    }

    // Get user ID from session or request
    const userId = req.session?.user?.id || req?.user?.id;

    // Check if the user is authorized to update the booking
    if (booking.user.toString() !== userId && booking.teacher.toString() !== userId) {
      return res.status(403).send({ error: 'Unauthorized to update this booking' });
    }

    // Check if the user is a teacher and trying to accept the booking
    if (value.status === 'accepted' && booking.teacher.toString() !== userId) {
      return res.status(403).send({ error: 'Only the teacher can accept the booking' });
    }

    // Check if the user is a user and trying to cancel or close the booking
    if (['cancelled', 'closed'].includes(value.status) && booking.user.toString() !== userId) {
      return res.status(403).send({ error: 'Only the user can cancel or close the booking' });
    }

    // Update the booking status
    booking.status = value.status;

    // Add cancellation or closure reason if provided
    if (value.status === 'cancelled' && value.cancellationReason) {
      booking.cancellationReason = value.cancellationReason;
    } else if (value.status === 'closed' && value.closureReason) {
      booking.closureReason = value.closureReason;
    }

    // Save the updated booking
    await booking.save();

    // Return response
    res.status(200).json({ message: 'Booking status updated', booking });
  } catch (error) {
    next(error);
  }
};


// Delete booking
export const deleteBooking = async (req, res, next) => {
  try {
    // Get booking ID from URL parameter
    const bookingId = req.params.id;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).send({ error: 'Booking not found' });
    }

    // Get user ID from session or request
    const userId = req.session?.user?.id || req?.user?.id;

    // Check if the user is authorized to delete the booking
    if (booking.user.toString() !== userId) {
      return res.status(403).send({ error: 'Unauthorized to delete this booking' });
    }

    // Check if the booking is in a state that allows deletion
    if (['accepted', 'closed'].includes(booking.status)) {
      return res.status(400).send({ error: 'Cannot delete a booking that is accepted or closed' });
    }
    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    // Remove the booking from the user's bookings array
    await User.findByIdAndUpdate(userId, { $pull: { bookings: bookingId } });

    // Return response
    res.status(200).json({ message: 'Booking deleted' });
  } catch (error) {
    next(error);
  }
};
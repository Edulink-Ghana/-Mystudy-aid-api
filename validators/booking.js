import Joi from "joi";

export const bookingValidator = Joi.object({

    user: Joi.string(),
    teacher: Joi.string().required(),
    timeslot: Joi.object({
        day: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
    }).required(),
    grade: Joi.string().required(),
    date: Joi.date().required(),
    area: Joi.string().required(),
    subject: Joi.string().required(),
});

export const updateBookingValidator = Joi.object({
    status: Joi.string().valid('accepted', 'cancelled', 'closed'),
    cancellationReason: Joi.string(),
    closureReason: Joi.string(),
});
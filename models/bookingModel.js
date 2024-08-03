
import { Schema, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const bookingSchema = new Schema({
    user: { type: Types.ObjectId, ref: 'User', required: true },
    teacher: { type: Types.ObjectId, ref: 'Teacher', required: true },
    timeslot: {
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
    },
    grade: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    subject: { type: String, required: true },
}, { timestamps: true });


bookingSchema.plugin(toJSON);

export const Booking = model("Booking", bookingSchema);

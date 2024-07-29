
import { Schema, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const bookingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "9:00-10:00"
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'canceled'], default: 'pending' },
}, {
    timestamps: true,
});

bookingSchema.plugin(toJSON);

export const Booking = model("Booking", bookingSchema);

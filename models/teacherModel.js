import { Schema, model, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";


const teacherSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  subjects: { type: [String], required: true },
  area: { type: String, required: true },
  curriculum: { type: String, enum: ['GES Curriculum', 'British Curriculum'], default: 'GES Curriculum' },
  grade: { type: String, required: true },
  availability: [{ 
    day: { type: String, required: true }, // e.g., 'Monday', 'Tuesday'
    startTime: { type: String, required: true }, // e.g., '09:00'
    endTime: { type: String, required: true }, // e.g., '17:00'
  }],
  costPerHour: { type: Number, required: true },
  qualifications: { type: [String], required: true },
  bookings: [{ type: Types.ObjectId, ref: 'Booking' }],
  specialNeedsExperience: { type: Boolean, default: false }, 
  reviews: [{
    user: { type: Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  }]
}, {
  timestamps: true,
});

teacherSchema.plugin(toJSON);

export const Teacher = model("Teacher", teacherSchema);

import { Schema, model, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";


const teacherSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  subjects: { type: [String] },
  area: { type: [String] },
  curriculum: { type: String, enum: ['GES Curriculum', 'British Curriculum'], default: 'GES Curriculum' },
  grade: { type: [String] },
  experience: { type: String},
  availability: [{ 
    day: { type: String,  }, 
    startTime: { type: String }, 
    endTime: { type: String }, 
  }],
  teachingMode: { type: String, enum: ['Online', 'In-person', 'Both'] },
  costPerHour: { type: Number },
  qualifications:{ type: [String] },
  bookings: [{ type: Types.ObjectId, ref: 'Booking' }],
  specialNeedsExperience: { type: Boolean, default: false }, 
  verified: { type: Boolean, required: true, default: false },
  role: { type: String, default: 'teacher'},
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

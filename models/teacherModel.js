import { Schema, model, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";


const teacherSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subjects: { type: [String], required: true },
    area: { type: String, required: true },
    availability: { type: [String], required: true },
    costPerHour: { type: Number, required: true },
    qualifications: { type: [String], required: true },
    reviews: [{
          user: { type:Types.ObjectId, ref: 'User' },
          rating: { type: Number, required: true },
          comment: { type: String, required: true },}]
  }, {
    timestamps: true,
    });

  teacherSchema.plugin(toJSON);

  export const TeacherModel = model("Teacher", teacherSchema);
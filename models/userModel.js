import { Schema, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";


const userSchema = new Schema({
    firstName: { type: String, required: true, },
    lastName: { type: String, required: true, },
    userName: { type: String, required: true, unique: true, },
    email: { type: String, required: true, unique: true, },
    password: { type: String, required: true, },
    role: { type: String, enum: ['student', 'parent'], default: 'student' },
}, {
    timestamps: true,
});

userSchema.plugin(toJSON);

export const UserModel = model("User", userSchema)


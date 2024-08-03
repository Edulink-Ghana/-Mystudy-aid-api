import { Schema, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";


// User Schema
const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user',enum: ['superadmin', 'admin', 'teacher', 'user']  },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }], // Reference to bookings
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }] ,// Reference to reviews
    verified: { type: Boolean, required: true, default: false},
},
    {
    timestamps: true,
});

// Convert to JSON
userSchema.plugin(toJSON);

// Export User Model
export const User = model("User", userSchema);


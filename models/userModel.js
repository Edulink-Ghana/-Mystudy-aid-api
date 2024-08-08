import { Schema, Types, model } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";
import mongooseErrors from "mongoose-errors";



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
    reviews: [{ 
        teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true }, // Reference to the teacher
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
    }],
    verified: { type: Boolean, required: true, default: false}
},
    {
    timestamps: true,
});
//reset token model 
const resetTokenSchema = new Schema({
    userId:{type:Types.ObjectId,required:true, ref:'User'},
    expired:{type:Boolean, default:false},
    expiredAt:{
        type:Date,
        default:() => new Date().setHours(new Date().getHours() + 2)
    }

},{
    timestamps:true
});

const verificationTokenSchema = new Schema({
    userId:{type:Types.ObjectId,required:true, ref:'User'},
    token:{type:String,required:true},
    expired:{type:Boolean, default:false},
    expiredAt:{
        type:Date,
        default:() => new Date().setHours(new Date().getHours() + 2)
    }

},{
    timestamps:true
})



// Convert to JSON
userSchema
.plugin(toJSON)
.plugin(mongooseErrors);

resetTokenSchema
.plugin(toJSON)
.plugin(mongooseErrors);

verificationTokenSchema
.plugin(toJSON)
.plugin(mongooseErrors);



// Export  Models
export const User = model("User", userSchema);
export const ResetToken = model("ResetToken", resetTokenSchema);
export const VerificationToken = model("VerificationToken", verificationTokenSchema);


import Joi from "joi"

export const teacherValidator = Joi.object({
    
    subjects: Joi.array().items(Joi.string()),
    area: Joi.string(),
    availability: Joi.array().items(Joi.string()),
    costPerHour: Joi.number(),
    qualifications: Joi.array().items(Joi.string()),
    grade: Joi.array().items(Joi.string()),
    experience: Joi.string(),
    teachingMode: Joi.string(),
    curriculum: Joi.string(),
    specialNeedsExperience: Joi.boolean(),


})

export const registerValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),

})

export const loginValidator = Joi.object({
    username: Joi.string().alphanum(),
    email: Joi.string().email(),
    password: Joi.string().required(),
});










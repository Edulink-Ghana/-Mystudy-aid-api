import Joi from "joi"

export const teacherValidator = Joi.object({
    
    subjects: Joi.array().items(Joi.string()).required(),
    area: Joi.string().required(),
    availability: Joi.array().items(Joi.string()).required(),
    costPerHour: Joi.number().required(),
    qualifications: Joi.array().items(Joi.string()).required(),
    grade: Joi.array().items(Joi.string())
})

export const registerValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
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










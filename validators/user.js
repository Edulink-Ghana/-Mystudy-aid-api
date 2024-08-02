import Joi from "joi";

export const registerValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string(),

})
//.with( 'password', 'confirmPassword')

export const loginValidator = Joi.object({
    userName: Joi.string().alphanum(),
    email: Joi.string().email(),
    password: Joi.string().required(),
});
export const userValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
})
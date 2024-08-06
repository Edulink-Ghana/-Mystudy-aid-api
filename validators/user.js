import Joi from "joi";

export const registerUserValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    

})

export const createUserValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string().required().valid('superadmin', 'admin'),


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

export const updateUserValidator = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    userName: Joi.string(),
    phoneNumber: Joi.string(),
    role: Joi.string().valid('superadmin', 'admin'),
})

export const forgotPasswordValidator = Joi.object({
    email:Joi.string().email().required(),
});

export const resetPasswordValidator =Joi.object({
    resetToken:Joi.string().required(),
    password:Joi.string().min(6).required(),
    confirmPassword:Joi.string().valid(Joi.ref('password')).required(),
})

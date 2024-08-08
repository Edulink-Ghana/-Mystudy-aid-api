import Joi from "joi"

export const reviewValidator= Joi.object({
    rating: Joi.number().required(),
    comment: Joi.string().required(),
});


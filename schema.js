const Joi = require('joi');
const passport = require('passport');

const schema = Joi.object({
    image: Joi.string().uri().required(),
    description: Joi.string().trim().required(),
    price: Joi.number().positive().precision(2).required(),
    category:Joi.string().required(),
    seller_name: Joi.string().trim()
});

const idSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

const userSchema=Joi.object({
    username:Joi.string().trim().required(),
    email:Joi.string().email().required(),
    password:Joi.string().min(8).max(72).required(),
});

const loginSchema=Joi.object({
    username:Joi.string().trim().required(),
    password:Joi.string().min(8).max(72).required(),
});

module.exports={schema,idSchema,userSchema,loginSchema};

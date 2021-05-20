const Joi = require('joi');

module.exports.joiCampgroundSchema = Joi.object({
    title: Joi.string().required(),
    image: Joi.string().required(),
    price: Joi.number().required().min(0),
    desciption: Joi.string().required(),
    location: Joi.string().required()
})

module.exports.joireviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        body: Joi.string().required()
    }).required()
})
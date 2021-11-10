const Joi = require("@hapi/joi");

const email = Joi.string()
  .email()
  .min(8)
  .max(254)
  .trim()
  .lowercase()
  .required()
  .label("Email");

const lastName = Joi.string()
  .alphanum()
  .min(3)
  .max(50)
  .trim()
  .required()
  .label("lastName");

const firstName = Joi.string().max(100).trim().required().label("firstName");

const password = Joi.string()
  .min(8)
  .max(100)
  .regex(/^(?=.*?[a-z])(?=.*?\d).*$/)
  .message("Must have at least one digit.")
  .required()
  .label("Password");

module.exports.signUp = Joi.object().keys({
  email,
  firstName,
  lastName,
  password,
});

module.exports.signIn = Joi.object().keys({
  email,
  password,
});

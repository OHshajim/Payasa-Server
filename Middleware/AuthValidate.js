const joi = require("joi");

const RegistrationValidate = (req, res, next) => {
  const schema = joi.object({
    number: joi.number().required(),
    email: joi.string().email().required(),
    pin: joi.number().required(),
    status: joi.string(),
    date: joi.string(),
    balance: joi.number(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", error });
  }
  next();
};

const LoginValidate = (req, res, next) => {
  const schema = joi.object({
    number: joi.number().required(),
    pin: joi.number().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", error });
  }
  next();
};

module.exports = {
    RegistrationValidate ,LoginValidate
}


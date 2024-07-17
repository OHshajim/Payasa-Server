const joi = require("joi");

const RegistrationValidate = (req, res, next) => {
  const schema = joi.object({
    number: joi.number().min(10).max(14).required(),
    email: joi.string().email().required(),
    pin: joi.number().min(5).max(5).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", error });
  }
  next();
};
const LoginValidate = (req, res, next) => {
  const schema = joi.object({
    number: joi.number().min(10).max(14).required(),
    email: joi.string().email().required(),
    pin: joi.number().min(5).max(5).required(),
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


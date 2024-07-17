const { registration, Login } = require('../Controller/AuthController');
const { RegistrationValidate, LoginValidate } = require('../Middleware/AuthValidate');
const router = require('express').Router();



router.post('/register',RegistrationValidate,registration)
router.post('/login',LoginValidate,Login)
module.exports = router ;
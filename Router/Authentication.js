const { RegistrationValidate } = require('../Middleware/AuthValidate');
const router = require('express').Router();

router.post('/login',(req,res)=>{
    res.send("login")
})
router.post('/register',RegistrationValidate)
module.exports = router ;
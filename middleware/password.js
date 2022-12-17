// Password control
const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator()
passwordSchema
.is().min(8)            // Minimum length 8
.is().max(100)          // Maximum length 100
.has().uppercase()      // Must have uppercase letters
.has().lowercase()      // Must have lowercase letters
.has().digits()         // Must have digit(s)
.has().not().spaces()   // Should not have spaces
.has().symbols()        // Must have symbol(s)

module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        next();
    } else {
        return res.status(400).json({message : "The password is not strong enough."})
    }
};
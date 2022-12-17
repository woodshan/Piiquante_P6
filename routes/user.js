// Express import
const express = require('express');

// Router function
const router = express.Router();

// Password control middleware import
const passwordValidator = require("../middleware/password");

// User controllers import
const userCtrl = require('../controllers/user');

// Endpoint signup and login
router.post('/signup', passwordValidator, userCtrl.signup);
router.post('/login', userCtrl.login);

// Module exportation
module.exports = router;
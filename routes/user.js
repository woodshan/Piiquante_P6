// Packages imports
const express = require('express');
// Router function
const router = express.Router();

// Password middleware importation
const passwordValidator = require("../middleware/password");

// User controllers importation
const userCtrl = require('../controllers/user');

// Endpoint signup and login
router.post('/signup', passwordValidator, userCtrl.signup);
router.post('/login', userCtrl.login);

// Module exportation
module.exports = router;
// Modules imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cryptoJs = require("crypto-js");
const dotenv = require("dotenv").config();

// User model import
const User = require("../models/User");

// Function to sign up
exports.signup = (req, res, next) => {

    const emailCryptoJs = cryptoJs.HmacSHA256(req.body.email, `${process.env.SECRET_KEY}`).toString();
    
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: emailCryptoJs,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "User created !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Function to login
exports.login = (req, res, next) => {
    const emailCryptoJs = cryptoJs.HmacSHA256(req.body.email, `${process.env.SECRET_KEY}`).toString();

   User.findOne({ email: emailCryptoJs})
       .then(user => {      
           if (!user) {
               return res.status(401).json({ error: 'Incorrect email or password' });
           }
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                // incorrect
                   if (!valid) {
                       return res.status(401).json({ error: 'Incorrect email or password' });
                   }
                   res.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                           { userId: user._id },
                           process.env.SECRET_TOKEN,
                           { expiresIn: '24h' }
                       )
                   });
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};
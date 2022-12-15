const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cryptoJs = require("crypto-js");
const dotenv = require("dotenv").config();

const User = require("../models/User");

exports.signup = (req, res, next) => {

// Chiffrer l'email avant de l'envoyer dans BD
    const emailCryptoJs = cryptoJs.HmacSHA256(req.body.email, `${process.env.SECRET_KEY}`).toString();
    
// Hacher mdp avant de l'envoyer dans la BD
// Salt = 10 fois => combien de fois sera executé algorythme de hachage
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: emailCryptoJs,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
// Chiffrer l'email avant de l'envoyer dans BD
    const emailCryptoJs = cryptoJs.HmacSHA256(req.body.email, `${process.env.SECRET_KEY}`).toString();

// Chercher dans la BD si l'utilisateur est présent
   User.findOne({ email: emailCryptoJs})
       .then(user => {
// Si le mail de user n'existe pas        
           if (!user) {
               return res.status(401).json({ error: 'Identifiant ou mot de passe introuvable' });
           }
        // Controler la validité du mdp du user
        // Compare mdp en clair et celui BD haché renvoie valid = boolean
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                //Si mdp est incorrect
                   if (!valid) {
                       return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
                   }
                // Mot de passe correct = renvoi dans réponse du serveur le userId et token d'authentification
                   res.status(200).json({
                // Objet créer et userId seront liés
                       userId: user._id,
                       token: jwt.sign(
                           { userId: user._id },
                           process.env.SECRET_TOKEN,
                        //Se relogger après 24h car token expire
                           { expiresIn: '24h' }
                       )
                   });
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};
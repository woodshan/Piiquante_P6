// Mongoose importation
const mongoose = require('mongoose');
// Mongoose-unique-validator importation
const uniqueValidator = require('mongoose-unique-validator');

// Modèle de base de donnée pour le signup (pour enregistrer nouvel utilisateur)
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Sécurité pour ne pas enregistrer 2 fois même adresse mail
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
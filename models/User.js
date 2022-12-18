// Mongoose importation
const mongoose = require("mongoose");
// Mongoose-unique-validator importation
const uniqueValidator = require("mongoose-unique-validator");

// User model creation for DB
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);

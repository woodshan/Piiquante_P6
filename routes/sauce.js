// Modules import
const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

// Controller sauce import
const sauceCtrl = require("../controllers/sauce");

// Create express router
const router = express.Router();

// CRUD steps
router.post("/", auth, multer, sauceCtrl.createSauce);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.get("/", auth, sauceCtrl.getAllSauces);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
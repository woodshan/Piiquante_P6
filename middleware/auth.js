// Middleware pour proteger les routes
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config();
 
module.exports = (req, res, next) => {
 // try catch car si pas de token requete plante donc erreur ira dans catch
   try {
    // récuperer le token dans le headers authorization à l'index 1 car il y a le bearer 0
       const token = req.headers.authorization.split(' ')[1];
    // Decoder le token
       const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
    // Recuperer l'userId qu'il y a dans le token
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
    // Passer au middleware suivant
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};
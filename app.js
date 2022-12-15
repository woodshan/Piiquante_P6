// Toutes les requetes entrantes et sortantes passent ici
// Modules import
const express = require('express');
const mongoose = require('mongoose');
const helmet = require("helmet");

// Travailler avec les chemins de fichiers
const path = require('path');

const rateLimit = require('express-rate-limit');
require("dotenv").config();
const cors = require('cors');

// Debug mongoose
mongoose.set("strictQuery", true);

// Routes import
const sauceRoutes = require("./routes/sauce");
const userRoutes = require('./routes/user');

// Creer une application express
const app = express();

app.use(cors());

mongoose.connect(process.env.DB_URL,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Gerer les problèmes de CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Transformer corps en json exploitable
app.use(express.json());

// Routes 
app.use("/api/sauces", sauceRoutes);
app.use('/api/auth', userRoutes);

// Acceder aux images du dossier images, image = fichier static
// dirname = nom du repertoire
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
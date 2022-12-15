// Gerer requetes http avec envoi de fichier
// Multer importation
const multer = require('multer');

// Les formats qui sont tolérés
// Ex : Lorsque le fichier sera lu par le middleware multer et qu'il verra images/jpg, il mettra comme extensiuon au fichier .jpg
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Destination du fichier et generer nom de fichier unique
const storage = multer.diskStorage({
  // Destination de stockage du fichier
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    // remplacer les espaces par des underscores
    const name = file.originalname.split(' ').join('_');
    // recuperer le format du fichier grace au mimetype (recuperer le mime type du fichier)
    const extension = MIME_TYPES[file.mimetype];
    // Recreer le nom du fichier en un nom unique grâce au timestemp
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Exportation du middleware multer single = envoyer qu'un seul fichier
module.exports = multer({storage: storage}).single('image');
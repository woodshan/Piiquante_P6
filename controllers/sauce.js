// Importation du modele de la base de donnée MongoDB
const Sauce = require("../models/Sauce");
// Permet d'intéragir avec systeme de fichiers y acceder
const fs = require("fs");

// CREATE
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  // l'instance sauce
  const sauce = new Sauce({
    // Ecrasé l'objet précedent
    ...sauceObject,
    userId: req.auth.userId,
    // Construire l'url de l'image req.protocol = http
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });

  // Enregistrer l'objet dans la BD
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// UPDATE
// Fonction pour modifier une sauce
exports.modifySauce = (req, res, next) => {
  // Objet qui va etre mises a jour dans la BD
  // Si req.file = true => Transforme en objet js ; Mettre le chemin complet de la nouvelle image
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
  // Sinon je change juste l'info que l'utilisateur a changé
    : { ...req.body };
    
  // Si req.file = un fichier(image) est present = true
  if(req.file) {
    Sauce.findOne({_id: req.params.id})
    .then((sauce) =>  {
    // Recuperation du nom du fichier a supprimer
      const filename = sauce.imageUrl.split("/images/")[1];
      //Suppression de l'ancienne image dans le dossier images
      fs.unlink(`images/${filename}`, (error) => {
        if(error) throw error;
      });      
    })
    .catch((error) => res.status.json({error}))
  };

  // Utilisation du modele mongoose appliquer méthode pour chercher l'objet grâce à son id dans la BD 
    Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
      // Verification de l'userId qui a crée la sauce et l'userId qui est connecté
        if(sauce.userId === req.auth.userId) {
      // Méthode pour modifier l'objet grâce à son id qui seront envoyé dans la BD
      // Mettre à jour la BD
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifiée" }))
          .catch((error) => res.status(400).json({ error }));
        } else {
          res.status(403).json({message : "Unauthorized !"})
        }
        })
      .catch((error) => res.status(500).json({error}));
};

// DELETE
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "unauthorized request" });
      } else {
      // Recupere le nom de l'image
        const filename = sauce.imageUrl.split("/images/")[1];
      // Supprime l'image dans le dossier images
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimée !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// READ
// Fonction qui affiche la sauce en question grâce à son id
exports.getOneSauce = (req, res, next) => {
  // Méthode pour chercher l'objet grâce à son id dans la BD
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => res.status(200).json(sauce))
  .catch((error) => res.status(404).json({error}));
};

// READ
// Fonction qui affiche toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (req.body.like) {
        case 1:
          if (
            !sauce.usersLiked.includes(req.body.userId) &&
            req.body.like === 1
          ) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
              }
            )

              .then(() =>
                res.status(201).json({ message: "L'utilisateur a aimé" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          break;

        case -1:
          if (
            !sauce.usersDisliked.includes(req.body.userId) &&
            req.body.like === -1
          ) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
              }
            )

              .then(() =>
                res.status(201).json({ message: "L'utilisateur n'aime pas" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          break;

        case 0:
          if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
              }
            )

              .then(() =>
                res.status(201).json({ message: "L'utilisateur est neutre" })
              )
              .catch((error) => res.status(400).json({ error }));
          }

          if (sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
              }
            )

              .then(() =>
                res.status(201).json({ message: "L'utilisateur est neutre" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          break;
      }
    })
    .catch((error) => res.status(404).json({ error }));
};

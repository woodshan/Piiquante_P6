// Sauce model import
const Sauce = require("../models/Sauce");

// File-system import
const fs = require("fs");

// CREATE
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Saved sauce !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// UPDATE
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  if (sauceObject.likes || sauceObject.dislikes) {
    delete sauceObject.likes;
    delete sauceObject.dislikes;
  };

  if (sauceObject.userId) {
    delete sauceObject.userId;
  };

  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) throw error;
        });
      })
      .catch((error) => res.status(400).json({ error }));
  }

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId === req.auth.userId) {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Modified sauce !" }))
          .catch((error) => res.status(400).json({ error }));
      } else {
        res.status(403).json({ message: "Unauthorized !" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// DELETE
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request !" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce removed !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// READ
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// READ
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Like or dislike function
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (req.body.userId === req.auth.userId) {
        switch (req.body.like) {
          case 1:
            // If usersliked is false and if like = 1, like +1
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

                .then(() => res.status(201).json({ message: "User liked" }))
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

                .then(() => res.status(201).json({ message: "User dislikes" }))
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
                  res.status(201).json({ message: "User is neutral" })
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

                .then(() => res.status(201).json({ message: "User liked" }))
                .catch((error) => res.status(400).json({ error }));
            }
            break;
        }
      } else {
        return res.status(403).json({ message: "Unauthorized !" });
      }
    })
    .catch((error) => res.status(404).json({ error }));
};

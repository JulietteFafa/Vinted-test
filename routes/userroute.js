const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");

//S'effectue lors de la création du compte
// Générer un Salt

router.post("/user/signup", async (req, res) => {
  try {
    const salt = uid2(16);
    const avatarSent = req.files.avatar.path;
    const avatarStocked = await cloudinary.uploader.upload(avatarSent);
    if (req.fields.username && req.fields.email) {
      const checkMailExist = await User.findOne({ email: req.fields.email });
      //console.log(checkMailExist); // null en log si email does not exist
      if (!checkMailExist) {
        //générer un HASH
        const hash = SHA256(req.fields.password + salt).toString(encBase64); // je hash mon pw
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
            avatar: avatarStocked,
          },
          token: uid2(16),
          hash: hash,
          salt: salt,
        });
        await newUser.save();
        const result = await User.findOne({ email: req.fields.email }).select(
          "_id token account"
        );
        res.json(result);
      } else {
        res.status(400).json({ message: "email already exist" });
      }
    } else {
      res.status(400).json({ message: "Missing Username or Email" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/user/login", async (req, res) => {
  try {
    if (req.fields.email && req.fields.password) {
      // si mail et password existent = les champs sont remplis
      const checklog = await User.findOne({ email: req.fields.email }); // si l'email existe bien dans la BDD
      if (checklog) {
        const pw = SHA256(req.fields.password + checklog.salt).toString(
          encBase64
        ); // je re hash et si le hash de mon pw est egale à celui rentré alors c'est bon
        if (pw === checklog.hash) {
          const result = await User.findOne({ email: req.fields.email }).select(
            "_id token account"
          ); // les objets n'ont pas d'index et ne peuvent pas etre classés
          res.json(result);
        } else {
          res.json({
            message: "Password is not correct",
          });
        }
      } else {
        res.json({
          message: "Account has not been created yet, please create an account",
        });
      }
    } else {
      res.json({ message: "Missing email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;

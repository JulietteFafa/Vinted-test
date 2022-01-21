const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI);

//Création du serveur
const app = express();
app.use(formidable());

//Connexion à la bdd
mongoose.connect("mongodb://localhost/vinted");

//import model User
const User = require("./models/User");
//import model Offer
const Offer = require("./models/Offer");

//route user
const userroute = require("./routes/userroute");
app.use(userroute);

// route publish
const publishroute = require("./routes/offer");
app.use(publishroute);

//route inexistantes
app.all("*", (req, res) => {
  res.status(400).json({ message: "address requested does not exist" });
});

//On démarre le serveur
app.listen(process.env.PORT, () => {
  console.log("Serveur has started !");
});

const cloudinary = require("cloudinary").v2;
const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const mongoose = require("mongoose");

const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = require("../middleware/IsAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const pictureToUpload = req.files.pictures.path;

    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { city: req.fields.city },
        { condition: req.fields.condition },
        { brand: req.fields.brand },
        { size: req.fields.size },
        { color: req.fields.color },
      ],

      owner: req.user,
    });
    await newOffer.save();

    const result = await cloudinary.uploader.upload(pictureToUpload, {
      folder: `vinted/offers/${newOffer._id}`,
    });
    newOffer.product_image = result;
    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/offers", async (req, res) => {
  try {
    const sort = req.query.sort.replace("price-", "");

    if (!req.query.page) {
      req.query.page = 1;
    }
    const offers = await Offer.find({
      product_name: new RegExp(req.query.title, "i"),
      product_price: { $gte: req.query.priceMin, $lte: req.query.priceMax },
    })
      .sort({ product_price: sort })
      .limit(2)
      .skip(2 * req.query.page - 2)
      .select("product_name product_price");
    console.log(2 * req.query.page);
    res.json(offers);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    //Òconsole.log(req.params.id);
    const offerSearched = await Offer.findById(req.params.id);
    res.status(200).json(offerSearched);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;

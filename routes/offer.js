const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.get("/offers", async (req, res) => {
  try {
    let filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = {
        $gte: req.query.priceMin,
      };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    } else if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    }

    let page;
    if (Number(req.query.page) < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    let limit = Number(req.query.limit);

    const offers = await Offer.find(filters)
      .populate({
        path: "owner",
        select: "account",
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Offer.countDocuments(filters);

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files.picture.path);

    const {
      title,
      description,
      price,
      brand,
      city,
      condition,
      color,
      size,
    } = req.fields;

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { COULEUR: color },
        { ÉTAT: condition },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    // console.log(newOffer);

    const result = await cloudinary.uploader.unsigned_upload(
      req.files.picture.path,
      {
        folder: `/vinted/offers/${newOffer._id}`,
        public_id: "preview",
        cloud_name: "dshrnc165",
      }
    );
    // console.log(result);

    newOffer.product_image = result;

    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/offer/update/:id", isAuthenticated, async (req, res) => {
  const offerToModify = await Offer.findById(req.params.id);
  try {
    if (req.fields.title) {
      offerToModify.product_name = req.fields.title;
    }
    if (req.fields.description) {
      offerToModify.product_description = req.fields.description;
    }
    if (req.fields.price) {
      offerToModify.product_price = req.fields.price;
    }

    const details = offerToModify.product_details;
    for (i = 0; i < details.length; i++) {
      if (details[i].MARQUE) {
        if (req.fields.brand) {
          details[i].MARQUE = req.fields.brand;
        }
      }
      if (details[i].TAILLE) {
        if (req.fields.size) {
          details[i].TAILLE = req.fields.size;
        }
      }
      if (details[i].ÉTAT) {
        if (req.fields.condition) {
          details[i].ÉTAT = req.fields.condition;
        }
      }
      if (details[i].COULEUR) {
        if (req.fields.color) {
          details[i].COULEUR = req.fields.color;
        }
      }
      if (details[i].EMPLACEMENT) {
        if (req.fields.location) {
          details[i].EMPLACEMENT = req.fields.location;
        }
      }
    }

    offerToModify.markModified("product_details");

    if (req.files.picture) {
      const result = await cloudinary.uploader.upload(req.files.picture.path, {
        folder: `/vinted/offers/${offerToModify._id}`,
      });
      offerToModify.product_image = result;
    }

    await offerToModify.save();

    res.status(200).json("Offer modified succesfully !");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

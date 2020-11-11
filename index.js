const { json } = require("express");
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(formidable());

mongoose.connect("mongodb://localhost/Vinted", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

cloudinary.config({
  cloud_name: "dshrnc165",
  api_key: "142326715193618",
  api_secret: "AEmEXr079dlpkYIHfOwfgDd4JNg",
});

// Import des routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: error.message });
});

app.listen(3000, () => {
  console.log("Server Started");
});

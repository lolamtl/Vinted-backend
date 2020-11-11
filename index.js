const { json } = require("express");
const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(formidable());
app.use(cors());

require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI);
app.listen(process.env.PORT, () => {
  console.log("Server started");
});

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

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: error.message });
});

app.listen(3005, () => {
  console.log("Server Started");
});

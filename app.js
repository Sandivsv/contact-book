const env = require('dotenv')
const express = require("express");
const bodyParser = require("body-parser");
const adminrouter = require("./router/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");

env.config();
const MONGODB_URL = process.env.URL;
const PORT = process.env.PORT || 3000;

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.set("views", "./views");

app.use(express.static(path.join(__dirname, "/public")));
app.use("/images", express.static(path.join(__dirname, "/images")));

app.use(
  session({
    secret: "MY_SESSION",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(adminrouter);

mongoose
  .connect(MONGODB_URL)
  .then((result) => {
    console.log("connected with the database");

    app.listen(PORT, function () {
      console.log(`the server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("met with an error!");
  });

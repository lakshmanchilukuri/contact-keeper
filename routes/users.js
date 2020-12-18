const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt_secret = config.get("jwt_secret");
var app = express();

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get("/", (req, res) => {
  res.json({ msg: "in router.grt" });
});

router.post("/", jsonParser, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) res.status(400).json({ msg: "user already exists" });
    else {
      user = new User({ name, email, password });
      const salt = await bcrypt.genSalt(10);
      const encodedpassword = await bcrypt.hash(password, salt);

      user.password = encodedpassword;
      await user.save();
    }

    let payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, jwt_secret, { expiresIn: 36000 }, (err, token) => {
      res.send(token);
    });
  } catch (error) {
    res.status(500).send("internal server error");
  }
});

module.exports = router;

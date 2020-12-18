const express = require("express");
const router = express.Router();
const { body, check, oneOf, validationResult } = require("express-validator");
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
var urlencodedParser = bodyParser.urlencoded({ extended: true });

router.get("/", (req, res) => {
  res.json({ msg: "in router.grt" });
});

// @route     POST api/users
// @desc      Regiter a user
// @access    Public
router.post(
  "/",
  jsonParser,
  [
    check("name", "Please add name").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      const { name, email, password } = req.body;
      try {

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
          res.status(200).json({ "jwt": token });
        });
      } catch (err) {
        console.error("err" + err.message);
        res.status(500).json({ msg: "internal server error" });
      }
    }
  }
);

module.exports = router;

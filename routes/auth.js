const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const { check, validationResult } = require('express-validator');
const auth = require("../middleware/auth");
const User = require("../models/User");



//login user
router.post('/',
  jsonParser,
  [
    check('email', 'Please Enter Email').not().isEmpty(),
    check('email', 'Please Enter Valid Email').isEmail(),
    check('password', 'Please Enter Password').not().isEmpty()
  ],
  async (req, res) => {
    // console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
    }
    try {
      const { email, password } = req.body;

      const dbuser = await User.findOne({ email });

      // console.log(dbuser);


      if (!dbuser) {
        res.status(200).send('Invalid Credentials');
        return;
      }

      const compare = await bcrypt.compare(password, dbuser.password);
      if (!compare) {
        res.status(200).send('Invalid Credentials');
        return;
      }

      const payload = {
        user: { id: dbuser.id }
      }

      jwt.sign(payload, config.get("jwt_secret"), (err, token) => {
        res.status(200).json({ 'Logged in': token });
      });




    } catch (err) {
      console.log(err.message);
      res.status(500).send('Internal Server Error');
    }

  });

//get logged in User
router.get('/', auth, async (req, res) => {


  const dbuser = await User.findById(req.user.id);
  console.log(dbuser);
  res.status(200).json({ dbuser });
})

module.exports = router;
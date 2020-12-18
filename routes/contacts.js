const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { check, validationResult } = require('express-validator');
const Contact = require("../models/Contact");
const User = require("../models/User");
const { compareSync } = require("bcryptjs");

//get all contacts for user
router.get('/', auth, async (req, res) => {

  try {
    const contacts = await Contact.find({ user: req.user.id })
    res.send(contacts);
  } catch (err) {
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

//add contact
router.post('/',
  jsonParser, [
  check('name', 'Please Enter Name of Contact').not().isEmpty(),
  check('email', 'Please Enter Valid Email').isEmail(),
  check('type', 'Type of contact is Required').not().isEmpty()

],
  auth,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }


    try {
      const { name, email, type, phone } = req.body;

      let contact = new Contact({ user: req.user.id, name, email, type, phone });

      await contact.save();

      res.send(contact);


    } catch (err) {
      res.status(500).json({ msg: 'internalservererror' });
    }

  });

router.put('/:id', jsonParser, auth, async (req, res) => {

  const contactid = req.params.id;
  const loggedinUser = req.user.id;

  try {
    let contact = await Contact.findById(contactid);

    if (!contact) {
      res.status(404).send('Contact doesnt exist');
      return;
    }
    //check whether contact belongs to user
    // console.log(loggedinUser)
    // console.log(contact.user.toString())
    if (contact.user.toString() !== loggedinUser) {
      res.status(401).send('Contact doesnt belong to user');
      return;
    }

    const userupdate = {};
    const { name, email, phone, type } = req.body;

    if (name) userupdate.name = name;
    if (email) userupdate.email = email;
    if (phone) userupdate.phone = phone;
    if (type) userupdate.type = type;

    // console.log('cid ' + contactid);
    contact = await Contact.findByIdAndUpdate(contactid, { $set: userupdate },
      { new: true });
    // console.log('cc ' + contact)
    res.json(contact);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: 'internalservererror' });
  }

});

router.delete('/:id', jsonParser, auth, async (req, res) => {
  const contactid = req.params.id;
  const loggedinUser = req.user.id;
  try {

    let contact = await Contact.findById(contactid);

    if (!contact) {
      res.status(404).send('Contact doesnt exist');
      return;
    }
    //check whether contact belongs to user
    // console.log(loggedinUser)
    // console.log(contact.user.toString())
    if (contact.user.toString() !== loggedinUser) {
      res.status(401).send('Contact doesnt belong to user');
      return;
    }

    await Contact.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Contact removed' });

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;


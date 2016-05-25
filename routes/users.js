var express = require('express');
var jwt = require('jsonwebtoken');

var router = express.Router();

var User = require('../models/user');


router.get('/getAllUsers', (req, res) => {
  User.find({}, (err, users) => {
    res.send(users);
  });
});

router.get('/getCurrentUser/:email', (req, res) => {
  User.findOne({ email: req.params.email }, (err, user) => {
    if(err) res.status(400).send(err);

    res.send(user);
  }).select('-password');

});

module.exports = router;

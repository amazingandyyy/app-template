'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var request = require('request');
var qs = require('querystring');
var moment = require('moment');

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  displayName: String,
  admin: { type: Boolean, default: false },
  picture: String,
  facebook: String,
  github: String
});

userSchema.statics.adminAuthorization = roleRequired => {
  return (req, res, next) => {

    console.log('req inside adminAuthorization method:', req);
    var token = req.cookies.accessToken;

    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if(err) return res.status(401).send({error: 'Authentication required.'});

      User.findById(payload._id, (err, user) => {
        if(err || !user) return res.status(401).send({error: 'User not found.'});
        req.user = user;

        if(roleRequired === 'admin' && !req.user.admin) {
          // they don't have admin privilages
          return res.status(403).send({error: 'Not authorized.'});
        }

        next(); // they have the required privilages
      }).select('-password');
    });
  };
};

userSchema.statics.createJWT = function(user) {
  var token = jwt.sign({
    _id: this._id,
    exp: moment().add(1, 'day').unix() // in seconds
  }, JWT_SECRET);
  return token;
}

var User = mongoose.model('User', userSchema);

module.exports = User;

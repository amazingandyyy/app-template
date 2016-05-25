'use strict';

var express = require('express');
var request = require('request');
var qs = require('querystring');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');




var router = express.Router();

var User = require('../models/user');

router.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Invalid email and/or password' });
    }
    bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid email and/or password' });
      }
      res.send({ token: User.createJWT(user) });
    });
  });
});


router.post('/signup', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken' });
    }

    bcrypt.hash(req.body.password, 12, (err, hash) => {
      var user = new User({
        displayName: req.body.displayName,
        email: req.body.email,
        password: hash
      });
      user.save(function(err, result) {
        if (err) {
          res.status(500).send({ message: err.message });
        }
        res.send({ token: User.createJWT(result) });
      });
    });

  });
});

router.post('/facebook', (req, res) => {

  var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
   var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
   var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
   var params = {
     code: req.body.code,
     client_id: req.body.clientId,
     client_secret: process.env.FACEBOOK_SECRET,
     redirect_uri: req.body.redirectUri
   };

   // Step 1. Exchange authorization code for access token.
 request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
   if (response.statusCode !== 200) {
     return res.status(500).send({ message: accessToken.error.message });
   }

   // Step 2. Retrieve profile information about the current user.
   request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
     if (response.statusCode !== 200) {
       return res.status(500).send({ message: profile.error.message });
     }
     if (req.header('Authorization')) {
       User.findOne({ facebook: profile.id }, function(err, existingUser) {

         if (existingUser) {
           return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
         }
         var token = req.header('Authorization').split(' ')[1];
         var payload = jwt.decode(token, process.env.JWT_SECRET);
         User.findById(payload.sub, function(err, user) {
           if (!user) {
             return res.status(400).send({ message: 'User not found' });
           }

           user.facebook = profile.id;
           user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
           user.displayName = user.displayName || profile.name;
           user.email = profile.email;
           user.save(function() {
             var token = User.createJWT(user);
             res.send({ token: token });
           });
         });
       });
     } else {
       // Step 3. Create a new user account or return an existing one.
       User.findOne({ facebook: profile.id }, function(err, existingUser) {
         if (existingUser) {
           var token = User.createJWT(existingUser);
           return res.send({ token: token, profile: profile });
         }
         var user = new User();
         user.facebook = profile.id;
         user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
         user.displayName = profile.name;
         user.email = profile.email;
         user.save(function(err, savedUser) {
           var token = User.createJWT(user);
           res.send({ token: token, profile: profile });
         });
       });
     }




   });
 });

});

router.post('/github', (req, res) => {
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userApiUrl = 'https://api.github.com/user';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: process.env.GITHUB_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
    accessToken = qs.parse(accessToken);
    var headers = { 'User-Agent': 'Satellizer' };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        User.findOne({ github: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, process.env.JWT_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.github = profile.id;
            user.picture = user.picture || profile.avatar_url;
            user.displayName = user.displayName || profile.name;
            user.email = profile.email;

            user.save(function() {
              var token = User.createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ github: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = User.createJWT(existingUser);
            return res.send({ token: token, profile: profile });
          }
          var user = new User();
          user.github = profile.id;
          user.picture = profile.avatar_url;
          user.displayName = profile.name;
          user.email = profile.email;

          user.save(function() {
            var token = User.createJWT(user);
            res.send({ token: token, profile: profile });
          });
        });
      }
    });
  });
});



module.exports = router;

var http = require('http');
var express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken'),
  db = require('../models'),
  passport = require('passport');

var bcrypt = require('bcrypt-nodejs');

//autorize access a route.
var authorization = function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
};

module.exports = function (app) {
  app.use('/api', router);
};

router.post("/users/:name",authorization,function(req,res)
{
  console.log("oi token seu valor é: "+req.token);
  res.status(200);
  res.send();
});

router.post('/users/:login/authenticate',function(req,res)
{
  var req_login = req.body.login;
  var req_password = req.body.password;
  db.User.findOne
  ({
    where: { login: req_login }
  }).then(function(user)
  {

    // user exist, return your token if password form match password data base
    if(user != null)
    {
      console.log("lol");
      console.log(user);
      if(db.User.validatePassword(req_password, user.password))
      {
        res.status(200);
        res.send({ token: user.token });
      }else
      {
          res.status(401);
          res.send({ error: "Password invalid" });
      }
    }
    else //create new user and return your token
    {
      var tokenUser = jwt.sign({ user: req_login }, "Oursecretsecret", {
         expiresIn : "5m" // expires in 24 hours
      });
      db.User.create
      ({
          login: req_login,
          password: generatePassword(req_password),
          token: tokenUser,
          admin: 0
      }).then(function(user)
      {
        res.status(200);
        res.send({ token: user.token });
      }).catch(function(error)
      {
        res.status(500);
        res.send({ error: error });
      });
    }
  }).catch(function(error)
  {
    res.status(500);
    res.send({error: error });
  });
});

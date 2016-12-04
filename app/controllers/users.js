var http = require('http');
var express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken'),
  db = require('../models'),
  passport = require('passport');

var bcrypt = require('bcrypt-nodejs');

generatePassword= function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

validatePassword = function(passwordForm,passwordDB){
  return bcrypt.compareSync(passwordForm,passwordDB);
}

createUser = function(loginUser,passwordUser,tokenUser,isAdmin,req,res){
}

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
}

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
  db.User.findOne
  ({
    where: { login: req.body.login }
  }).then(function(user)
  {
    // user exist, return your token if password form match password data base
    if(user != null)
    {
      if(validatePassword(req.body.password,user.password))
      {
        res.status(200);
        res.send
        ({
          name: user.login,
          token: user.token,
          admin: user.admin
        });
      }
      else
      {
        // Incorrect password
        res.status(401);
      }
    }
    else //create new user and return your token
    {
      var tokenUser = jwt.sign({ user:req.body.login }, "Oursecretsecret", {
        // expiresIn : "5m" // expires in 24 hours 
      });

      db.User.create
      ({
        login: req.body.login,
        password: generatePassword(req.body.password),
        token: tokenUser,
        admin: 0
      }).then(function(user)
      {
        res.status(200);
        res.send
        ({
          token:user.token,
          admin: user.admin
        });
      });
    }
  }); 
});

"use strict";

var bcrypt = require('bcrypt-nodejs'),
  db = require('../models'),
  express = require('express'),
  helpers = require('../helpers'),
  jwt = require('jsonwebtoken'),
  http = require('http'),
  requestHelper = helpers.requestHelper,
  router = express.Router(),
  passport = require('passport');
  

const generatePassword = (password) =>{
  return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

const validatePassword = (passwordForm,passwordDB) =>{
  return bcrypt.compareSync(passwordForm,passwordDB);
}


//autorize access a route.
var authorization = function ensureAuthorized(req, res, next) {
    let bearerHeader = req.headers["authorization"],
      bearerToken;
    
    if (typeof bearerHeader !== 'undefined') {
        let bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } 
    else {
      requestHelper.sendAnswer(res,{},403);
    }
}

module.exports = function (app) {
  app.use('/api', router);
};

router.post("/users/:name",authorization, (req,res) =>{
  console.log("oi token seu valor é: "+req.token);
  requestHelper.sendAnswer(res, {}, 200);
});

router.post('/users/:login/authenticate',(req,res) => {
  db.User.findOne ({
    where: { login: req.body.login }
  })
  .then((user) =>{
    // user exist, return your token if password form match password data base
    if(user != null){
      if(validatePassword(req.body.password,user.password)){
        let responseBody = ({
          name: user.login,
          token: user.token,
          admin: user.admin
        });
        requestHelper.sendAnswer(res,responseBody, 200);
      }
      else {
        requestHelper.sendAnswer(res,{}, 401);
      }
    }
    else{ //create new user and return your toke
      var tokenUser = jwt.sign({ user:req.body.login }, "Oursecretsecret", {
        // expiresIn : "5m" // expires in 24 hours 
      });

      db.User.create({
        login: req.body.login,
        password: generatePassword(req.body.password),
        token: tokenUser,
        admin: 0
      })
      .then((user) =>{
        let auth = {token: user.token, admin: user.admin};
        requestHelper.sendAnswer(res,auth, 200);
      });
    }
  }); 
});

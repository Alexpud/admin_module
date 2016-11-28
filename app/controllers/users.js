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
   db.User.create(
      {
        login: loginUser,
        password: generatePassword(passwordUser),
        token: tokenUser,
        admin: isAdmin
      }).then(function(user){
        res.json({'token':user.token});
        res.status(200);
        res.send();
      });
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
  db.User.findAll({
    limit: 1,
    where: {
      login: req.body.login
    },
    order: [ [ 'createdAt', 'DESC' ]]
  }).then(function(user){
    // user exist, return your token if password form match password data base
    if(user[0] != null)
    {
      if(validatePassword(req.body.password,user[0].password))
      {
        res.status(200);
        console.log(user[0].login);
        res.json({'token': user[0].token})
       // res.send();        
      }else
      {
          res.status(401);
          res.json({"erro":true, "status":401})
         // res.send("Senha incorreta");
      }

    }
    else //create new user and return your token
    {
      var tokenUser = jwt.sign({ user:req.body.login }, "Oursecretsecret", {
        // expiresIn : "5m" // expires in 24 hours 
      });
      createUser(
        req.body.login,
        req.body.password,
        tokenUser,
        req.body.admin,req,res);
    }
  }); 
});

var http = require('http');
var express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken'),
  db = require('../models'),
  passport = require('passport');

module.exports = function (app) {
  app.use('/api', router);
};

router.post("/users/:name",function(req,res)
{
	db.User.create
	({
		login: req.params.name,
		password: req.body.password,
		admin: req.body.admin
	}).then(function()
	{
		res.status(204);
		res.send();
	});
});

router.post('/users/:login/authenticate',function(req,res)
{
  db.User.findOrCreate
  ({
    where:
    {
      login: req.params.login,
      password: req.body.password
    }
  }).spread(function(user, created)
  {
    console.log(created)
  	// new user created, so insert your token.
  	if(created && user !== null)
  	{
	  	var tokenUser = jwt.sign({ user:req.body.login }, "ilovescotchyscotch", {
	     // expiresIn : "5m" // expires in 24 hours
	  });
	  	//insert token on data base.
  		db.User.update({ token: tokenUser }, //change login to field token on the table
			{
        where:
        {
          login: req.body.login,
          password: req.body.password
        }
			}).then(function()
      {
				res.status(200);
				res.send({"token": tokenUser});
			}).catch(function (err)
        {
          res.status(409);
          res.send({error: err.errors});
        });
  		// return the information including token as JSON
  	}else if(user !== null)
  	{ //retrieve token user
  		res.status(200);
  		res.send({ "token": user.token });
  	}
  });
});

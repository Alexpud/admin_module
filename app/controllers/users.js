var http = require('http');
var express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken'),
  db = require('../models'),
  passport = require('passport');
  
module.exports = function (app) {
  app.use('/api', router);
};

router.get("/teste2",function(req,res){
	res.send("<p> PORRA </p>");
});

router.post("/users/",function(req,res)
{
	db.User.create
	({
		login: req.body.login,
		password: req.body.password, 
		admin: req.body.admin
	}).then(function()
	{
		res.status(204);
		res.send();	
	});
});

router.post('/authenticate',function(req,res){

  db.User.findOrCreate({where: {login: req.body.login, password: req.body.password}})
  .spread(function(user, created)
  {
  	// new user created, so insert your token.
  	if(created)
  	{
	  	var tokenUser = jwt.sign({user:req.body.login}, "ilovescotchyscotch", {
	    expiresIn : "5m" // expires in 24 hours
	  });

	  	//insert token on data base.
  		db.User.update(
  			{ token: tokenUser,}, //change login to field token on the table
			{
  				where: 
  				{
    				login: req.body.login,
    				password: req.body.password
  				}
			}).then(function(){
				res.json({'token': tokenUser });
				res.status(204);
				res.send();				
			}).catch(function (err)
        {
          res.status(409);
          res.send({error: err.errors});
        });

  		// return the information including token as JSON

			
  	}else
  	{ //retrieve token user
  		res.json({'token_retornado': user.token})
  	}
	
//	console.log(user.get({plain: true }))
//	console.log(created)

	
	    
  })
});


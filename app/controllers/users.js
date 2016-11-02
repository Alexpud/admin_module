var http = require('http');
var express = require('express'),
  router = express.Router(),
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


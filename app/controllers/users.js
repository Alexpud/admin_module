var http = require('http');
var express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken'),
  db = require('../models'),
  passport = require('passport'),
  authorization = require('../auth/auth'),
  bcrypt = require('bcrypt-nodejs');

module.exports = function (app) {
  app.use('/api', router);
};

/*router.post("/users/:name",authorization,function(req,res)
{
  console.log("oi token seu valor é: "+req.token);
  res.status(200);
  res.send();
});*/
/*
  This action is deeply linked to login, it is going to be discussed a better place to place it.
 */

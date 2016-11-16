var http = require('http');
var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    db = require('../models'),
    passport = require('passport'),
    authorization = require('../auth/auth.js'),
    bcrypt = require('bcrypt-nodejs');

var cfg = require("../config/config.js");

module.exports = function (app) {
    app.use('/api', router);
};


var auth = new authorization();

router.get("/users",auth.authenticate(),function(req,res)
{
   res.json(req.user);
});

router.post("/login", function(req,res)
{
    var req_login = req.body.login,
        req_password = req.body.password;

    db.User.findOne
    ({
        where: { login: req_login }
    }).then(function(user)
    {
        if (user != null) //If a user was found, it will update the user token
        {
            if ( db.User.validatePassword(req_password, user.password))
            {
                var tokenUser = jwt.sign({ user: req_login },cfg.jwtSecret, {
                    //expiresIn : "5m" // expires in 24 hours
                });
                console.log("asdas");
                user.token = tokenUser;
                user.save().then(function()
                {
                    res.status(200);
                    res.json({token: "JWT " + user.token});
                }).catch(function(error)
                {   res.send(error);
                });
            }
            else
            {
                res.status(400);
                res.send({error: "Wrong password"});
            }
        }
        else
        {
            var tokenUser = jwt.sign({ user: req_login },cfg.jwtSecret, {
                //expiresIn : "5m" // expires in 24 hours
            });
            db.User.create
            ({
                login: req_login,
                password: db.User.generatePassword(req_password),
                token: tokenUser,
                admin: 0
            }).then(function(user)
            {
                res.status(200);
                res.send({ token:"JWT " + user.token });
            }).catch(function(error)
            {
                res.status(500);
                res.send({ error: error });
            });
        }
    });
});
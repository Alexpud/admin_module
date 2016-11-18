var http = require('http');
var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    db = require('../models'),
    passport = require('passport'),
    authorization = require('../auth/auth.js'),
    bcrypt = require('bcrypt-nodejs');

var cfg = require("../config/config.js");

var ldap = require('ldapjs');
var cliente = ldap.createClient({
  url:'ldap://localhost'
});

var opts = {
  scope: 'sub'
};

module.exports = function (app) {
    app.use('/api', router);
};


var auth = new authorization();

router.get("/users",auth.authenticate(),function(req,res)
{
   res.json({login:req.user.login,isAdmin:req.user.admin});
});

router.post("/login", function(req,res)
{
    var req_login = req.body.login,
        req_password = req.body.password;


    //Authenticate Ldap
    cliente.bind('cn='+req_login+',ou=users, dc=test,dc=com',req_password, function(err)
    {
        if(err)
        {
            console.log(err);
            res.status(400);
            console.log("Wrong password");
            res.send({error: "Wrong password"});
        }
        else 
        {
            console.log('authenticated');
            //Logs Ldap
            cliente.search('cn='+req_login+',ou=users, dc=test,dc=com', opts, function (err, res)
            {
               
                res.on('searchEntry', function(entry) {
                  console.log('entry: ' + JSON.stringify(entry.object));
                });
                res.on('searchReference', function(referral) {
                  console.log('referral: ' + referral.uris.join());
                });
                res.on('error', function(err) {
                  console.error('error: ' + err.message);
                });
                res.on('end', function(result) {
                  console.log('status: ' + result.status);
                });

            });


            db.User.findOne
            ({
                where: { login: req_login }
            }).then(function(user){

                if (user != null) //If a user was found, it will update the user token
                {
                    if ( db.User.validatePassword(req_password, user.password))
                    {
                        var tokenUser = jwt.sign({ user: req_login },cfg.jwtSecret, {
                            expiresIn : "24h" // expires in 24 hours
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
                        console.log("Wrong password");
                        res.send({error: "Wrong password"});
                    }
                }
                else
                {
                    var tokenUser = jwt.sign({ user: req_login },cfg.jwtSecret, {
                        expiresIn : "24h" // expires in 24 hours
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
        }
    });

});
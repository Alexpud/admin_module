var passport = require("passport");
var passportJWT = require("passport-jwt");
var dataBase = require("../models");
var cfg = require("../config/config.js");
var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;

var params = {
    secretOrKey: cfg.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};


var authorization = function()
{
    var strategy = new Strategy(params, function(payload, done) {
        var loginUser = payload.user;
        console.log("Dentro do strategy: "+ loginUser);

        dataBase.User.findOne
        ({
            where: { login: loginUser }
        }).then(function(user){
            if (user != null) 
            {
                return done(null,user);
            }
            else
            {
                return done(null,false);
            }
        });
    });

    this.initialize = function()
    {
      return passport.initialize();
    };
    this.authenticate = function()
    {
      return passport.authenticate("jwt", cfg.jwtSession);
    };

  passport.use(strategy);
};

module.exports = authorization;
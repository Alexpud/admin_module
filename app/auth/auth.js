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


module.exports = function() 
{
    var strategy = new Strategy(params, function(payload, done) {
        var loginUser = payload.login;
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

    passport.use(strategy);
    return 
    {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", cfg.jwtSession);
        }
    };
};
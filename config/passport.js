var passport = require('passport'),
  db = require('../app/models'),
  LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport)
{
  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new LocalStrategy(
    function (username, password, done) {
        return done(null, user);
    }
  ));
};

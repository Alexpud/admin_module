

var express = require('express'),
  config = require('./config/config'),
  db = require('./app/models');
var authorization = require('./app/auth/auth.js');
var auth = new authorization();
var app = express();

require('./config/express')(app, config);

db.sequelize
  .sync()
  .then(function () {
    app.use(auth.initialize());
    app.listen(config.port, function () {
      console.log('Express server listening on port ' + config.port);
    });
  }).catch(function (e) {
    throw new Error(e);
  });


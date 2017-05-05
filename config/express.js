require('passport');
var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var exphbs = require('express-handlebars');
var passport = require('passport');
allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if ('OPTIONS' === req.method) {
        res.send(200);
    } else {
        next();
    }
};


module.exports = function(app, config) {
    var env = process.env.NODE_ENV || 'development';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env == 'development';
    // Add headers
    app.use(function(req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');


        // Pass to next layer of middleware
        next();
    });
    app.engine('handlebars', exphbs({
        layoutsDir: config.root + '/app/views/layouts/',
        defaultLayout: 'main',
        partialsDir: [config.root + '/app/views/partials/']
    }));
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'handlebars');

    // app.use(favicon(config.root + '/public/img/favicon.ico'));
    app.use(allowCrossDomain);
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(compress());
    app.use(express.static(config.root + '/public'));
    app.use(methodOverride());
    app.use(passport.initialize());

    var controllers = glob.sync(config.root + '/app/controllers/*.js');
    controllers.forEach(function(controller) {
        require(controller)(app);
    });

    //Creating a route folder
    var routes = glob.sync(config.root + '/app/routes/*.js');
    routes.forEach(function(route) {
        require(route)(app);
    });

    app.get('*', function(req, res) {
        res.sendfile('./public/js/angular/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    //Including javascript libraries
    var libs = glob.sync(config.root + '/lib/javascript/*.js');
    libs.forEach(function(lib) {
        require(lib)(app);
    });

    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err,
                title: 'error'
            });
        });
    }

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {},
            title: 'error'
        });
    });

};
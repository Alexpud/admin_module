//autorize access a route.
var http = require('http');
var jwt = require('jsonwebtoken'),
    db = require('../models'),
    passport = require('passport'),
    authorization = require('../auth/auth'),
    bcrypt = require('bcrypt-nodejs');

var authenticate = function()
{
    this.authorization = function ensureAuthorized(req, res, next) {
        var bearerToken;
        var bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined')
        {
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];
            req.token = bearerToken;
            console.log(bearer);
        } else {
            res.send(403);
        }
    }
}

module.exports = authenticate;
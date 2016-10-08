var workspace_creation = require('../../public/js/workspace_helper');
var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/', router);
};

router.get('/container',function ( req, res, next)
{
  res.render('container');
});

router.get('/list_containers', function( req, res, next)
{
  db.Container.findAll({raw:true}).then( function(container_list)
  {
    //var _containers = container_list.get({plain: true});
    console.log(container_list);
    res.send(container_list);
  });
});

router.post('/container_test', function( req, res, next)
{
  console.log(req.body);
  res.render('containers');
});


/*
  It creates a container, both in the database and a container named after the user registration_ID.
  The creation of the registration_ID is left to nginx server block that is listening on port 8082.
 */
router.post('/container', function (req, res, next)
{
  db.Container.findOrCreate
  ({
    where:
    {
      registration_ID: req.body.reg_id,
      name: req.body.name
    }
  }).then(function()
  {
    db.Container.findOne
    ({
      where:
      {
        registration_ID: req.body.reg_id
      }
    }).then(function(container)
    {
      var options = {
        host: '192.168.25.10',
        port: 8082,
        path: '/'+container.registration_ID,
        method: 'GET'
      };

      var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
      });
      req.write("");
      req.end();
    });
  });
  res.end();
});


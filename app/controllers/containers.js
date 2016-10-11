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

/*
  First, it retrieves the containers list from the database then, it uses promises package to make
  http requests to nginx for every container registration_ID, and creating a new JSON array with the
  previous container list but with a new value, the status of the  container which is obtained as
  a response from nginx.

  I am using promises because it allows me to wait for all the requests inside the list promises to finish,
  then it executes an action on Promises.all.
 */
router.get('/list_containers', function(req,res,next)
{
  db.Container.findAll({raw:true}).then( function(container_list)
  {
    var new_container_list = container_list;
    var promises = [];

    for( var i = 0; i< container_list.length; i++)
    {
      console.log(container_list[i]);
      promises.push( new Promise(function( resolve,reject)
      {
        var options = {
          host: 'localhost',
          port: 8083,
          path: '/status/container/'+container_list[i].registration_ID,
          method: 'GET'
        };

        var req = http.request(options, function (res)
        {
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log(chunk);
            resolve
            ({
              data:chunk
            });
          });
        });
        req.end();
      }));
    }
    Promise.all(promises).then(function(allData)
    {
      for(var i = 0; i < container_list.length;i++)
      {
        new_container_list[i].status = allData[i].data;
      }

      return new_container_list;
    }).then(function(new_container_list)
    {
      res.send(new_container_list);
    });
  });
});

router.get('/test/listing', function (req, res, next)
{
  db.Container.findAll( { limit: 10, order: [['port','DESC']]}).then
  (function(container)
  {
    console.log(container);
    res.send(container);
  });
});

/*
  It creates a container, both in the database and a container named after the user registration_ID.
  The creation of the registration_ID is left to nginx server block that is listening on port 8082.
 */
router.post('/create/container', function (req, res, next)
{

  db.Container.findOrCreate
  ({
    where:
    {
      port: 8090,
      registration_ID: req.body.registration_id,
      name: req.body.name
    }
  }).then(function()
  {
    db.Container.findOne
    ({
      where:
      {
        registration_ID: req.body.registration_id
      }
    }).then(function(container)
    {
      var options = {
        host: 'localhost',
        port: 8083,
        path: '/start/container/'+container.registration_ID,
        method: 'GET'
      };

      var nginx_req = http.request(options, function(nginx_res) {
        nginx_res.setEncoding('utf8');
        nginx_res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
      });

      nginx_req.end();
    });
  });
  res.end();
});

router.post('/stop/container', function (req, res, next)
{
  db.Container.findOne(
    {
      where:
      {
        registration_ID: req.body.registration_id
      }
    }).then( function( container) {
      var options = {
        host: 'localhost',
        port: 8083,
        path: '/stop/container/'+container.registration_ID,
        method: 'GET'
      };

      var nginx_req = http.request(options, function(nginx_res) {
        nginx_res.setEncoding('utf8');
        nginx_res.on('data', function (chunk) {
          console.log('Bodys: '+chunk);
        });
      });
      nginx_req.end();
    });
  res.end();
});


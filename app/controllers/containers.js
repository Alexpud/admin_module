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
      promises.push( new Promise(function( resolve,reject)
      {
        var options = {
          host: 'localhost',
          port: 8083,
          path: '/'+container_list[i].registration_ID,
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

router.get('/container_status/:container', function( req, resi, next)
{
  var container = req.params.container;
  var data = "";
  var options = {
    host: '192.168.25.10',
    port: 8083,
    path: '/'+container,
    method: 'GET'
  };

  var req = http.request(options, function (res)
  {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
      console.log(chunk);
      data = chunk;
    });
    res.on('end',function()
    {
      console.log("Over");
      resi.send(data);
    });
  }).end();

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

function getContainersStatus(container_list)
{

  var new_container_list = container_list;
  var promises = [];

  for( var i = 0; i< container_list.length; i++)
  {
    promises.push( new Promise(function( resolve,reject)
    {
      var options = {
        host: 'localhost',
        port: 8083,
        path: '/'+container_list[i].registration_id,
        method: 'GET'
      };

      var req = http.request(options, function (res)
      {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
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
    console.log(allData);
    for( var i = 0; i < container_list; i ++)
    {
      new_container_list[i].status = allData[i].data;
      console.log("lol");
    }
  });
};

var request = require('../../public/js/request_helper');
var request_helper = new request();
var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/api', router);
};

router.get('/test', function( req, res, next)
  {
    db.Container.findAll(
      {
        include:[{model:db.Workspace}]
      }).then(function(list)
    {
      console.log(JSON.stringify(list));
    });
  }
);

/*
  First, it retrieves the containers list from the database then, it uses promises package to make
  http requests to nginx for every container registration_ID, and creating a new JSON array with the
  previous container list but with a new value, the status of the  container which is obtained as
  a response from nginx.

  I am using promises because it allows me to wait for all the requests inside the list promises to finish,
  then it executes an action on Promises.all.
 */
router.get('/container/list', function(req,res,next)
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
          path: '/container/status/'+container_list[i].registration_ID,
          method: 'GET'
        };

        var req = http.request(options, function (res)
        {
          res.setEncoding('utf8');
          res.on('data', function (chunk)
          {
            resolve({ data:chunk });
          });
        });
        req.end();
      }));
    }
    Promise.all(promises).then(function(allData)
    {

      for(var i = 0; i < container_list.length; i++)
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

router.post('/container/create', function (req, res, next)
{
  var new_container_port_value = 0;
  /*
    Returns a list ordered by the container port in descending order.
   */
  db.Container.findAll( { limit: 1, order: [['port','DESC']]}).then(function(container_list)
  {
    if( container_list.length == 0)
    {
      new_container_port_value = 8090;
    }
    else //Grabs the biggest value, increase it by one
    {
      new_container_port_value = container_list[0].port + 1;
    }
  }).then(function()
  {
    db.Container.findOrCreate
    ({
      where:
      {
        port: new_container_port_value,
        registration_ID: req.body.registration_id,
        name: req.body.name
      }
    }).then(function ()
    {
      db.Container.findOne
      ({
        where:
        {
          registration_ID: req.body.registration_id
        }
      }).then(function (container)
      {
        request_helper.make_request('GET','localhost',8083,'/start/container',container.registration_ID);
      });
    });
  });
  res.end();
});

/*
  It creates a container, both in the database and a container named after the user registration_ID.
  The creation of the registration_ID is left to nginx server block that is listening on port 8082.
 */

router.post('/container/stop', function (req, res, next)
{
  db.Container.findOne
  ({
      where:
      {
        registration_ID: req.body.registration_id
      }
  }).then( function( container)
    {
      request_helper.make_request('GET','localhost',8083,'/stop/container',container.registration_ID);
    });
  res.end();
});

router.get('/container/status/:id',function(req,res,next)
{
  promises = [];
  promises.push(new Promise(function(resolve,reject)
  {
    var options =
    {
      host: "localhost",
      port: 8083,
      path: "/container/status/"+req.params.id,
      method: 'GET'
    };

    var reqs = http.request(options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        resolve({status: chunk});
      });
    });
    reqs.end();
  }));
  Promise.all(promises).then(function(data)
  {
    res.send(data[0]);
  });
});


router.delete('/container/delete', function(req,res,next)
{
  db.Container.findOne({
    where:
    {
      registration_ID: req.body.registration_ID
    }
  }).then(function(container)
  {
    container.destroy({force: true}).on('success',function(msg)
    {
      console.log(msg);
    })
  });
  res.end();
});

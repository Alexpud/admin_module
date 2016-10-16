const exec = require('child_process').exec;
var request = require('../../public/js/request_helper');
var request_helper = new request();
var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/api', router);
};

/*
 First, it retrieves the containers list from the database then, it uses promises to execute the bash script
 responsible for OS operations with docker, actions like: start, stop, status and create.

 I am using promises because it allows me to wait for all the requests inside the list promises to finish,
 then it executes an action on Promises.all.
 */
router.get('/container/list', function(req,res,next)
{
  db.Container.all({raw:true}).then( function(container_list)
  {
    var new_container_list = container_list;
    var promises = [];

    for (var i = 0; i < container_list.length; i++) {
      promises.push(new Promise(function (resolve, reject)
      {
        exec("./public/bash/che_helper_functions.sh status " + container_list[i].registration_ID,
          function(err,stdout,stderr)
          {
            resolve({status:stdout});
          });
      }));
    }
    Promise.all(promises).then(function (allData)
    {
      var temp = "";
      for(var i = 0; i < container_list.length;i++)
      {
        var temp = allData[i].status.replace('\n', "");
        container_list[i].status = temp;
      }
      return container_list;
    }).then(function(container_list)
    {
      res.send(container_list);
    });
  });
});

router.post('/container/start', function(req, res, next)
{
  db.Container.findOne({
    where:
    {
      registration_ID: req.body.registration_id
    }
  }).then(function(container)
  {
    var promise = new Promise(function(resolve,reject)
    {
      exec("./public/bash/che_helper_functions.sh start " + container.registration_ID,
        function(err,stdout,stderr)
        {
          resolve({response:stdout});
        });
    }).then(function(data)
    {
      console.log(data);
      var temp = data.response.replace('\n', "");
      res.send({response:temp});
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
        where: { registration_ID: req.body.registration_id }
      }).then(function (container)
      {
        var promise = new Promise(function(resolve,reject)
        {
          exec("./public/bash/che_helper_functions.sh create " + container.registration_ID + " " + container.port,
            function(err,stdout,stderr)
            {
              console.log(stdout);
              resolve({status:stdout});
            });
        }).then(function(data)
        {
          var temp = data.response.replace('\n', "");
          res.send({response:temp});
        });
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
    where: { registration_ID: req.body.registration_id }
  }).then( function( container)
    {
      var promise = new Promise(function(resolve,reject)
      {
        exec("./public/bash/che_helper_functions.sh stop " + container.registration_ID,
          function(err,stdout,stderr)
          {
            resolve({response:stdout});
          });
      }).then(function(data)
      {
        console.log(data);
        var temp = data.response.replace('\n', "");
        res.send({response:temp});
      });
    });
});

router.get('/container/status/:id',function(req,res,next)
{
  db.Container.findOne({
    where:
    {
      registration_ID: req.params.id
    }
  }).then(function(container)
  {
    var promise = new Promise(function (resolve, reject)
    {
      exec("./public/bash/che_helper_functions.sh status " + container.registration_ID,
        function(err,stdout,stderr)
        {
          resolve({status:stdout});
        });
    }).then(function(data)
    {
      var temp = data.status.replace('\n', "");
      res.send({status:temp});
    });
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
      var promise = new Promise(function (resolve, reject)
      {
        exec("./public/bash/che_helper_functions.sh delete " + container.registration_ID,
          function(err,stdout,stderr)
          {
            resolve({response:stdout});
          });
      }).then(function(data)
      {
        var temp = data.response.replace('\n', "");
        res.send({status:temp});
      });
    })
  });
});

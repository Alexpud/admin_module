const exec = require('child_process').exec;
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
router.get('/containers', function(req,res,next)
{
  db.Container.all({ raw: true }).then( function(container_list)
  {
    var new_container_list = container_list;
    var promises = [];
    for (var i = 0; i < container_list.length; i++)
    {
      promises.push(new Promise(function (resolve, reject)
      {
        exec("./public/bash/che_helper_functions.sh status " + container_list[i].registration_ID,
          function(err, stdout, stderr)
          {
            resolve({ status: stdout });
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

//Gets all the workspaces belonging to a container
router.get("/containers/:id/workspaces", function (req, res, next)
{
  db.Container.findOne
  ({
    include: [{
      model: db.Workspace,
      where: { owner_id: req.params.id }
    }]
  }).then( function(container_workspaces_list)
  {
    var temp_container_workspaces_list = container_workspaces_list;
    var promise = (new Promise(function (resolve, reject)
    {
      exec("./public/bash/che_helper_functions.sh status " + temp_container_workspaces_list .registration_ID,
        function(err, stdout, stderr)
        {
          resolve({ status: stdout });
        });
    })).then( function(data)
    {
      temp_container_workspaces_list = temp_container_workspaces_list;
      container_workspaces_list.port = data.status;
    }).then(function()
    {
      res.send(container_workspaces_list);
    });
  });
});


router.post('/containers/:registration_id/start', function(req, res, next)
{
  db.Container.findOne({
    where: { registration_ID: req.params.registration_id}
  }).then(function(container)
  {
    if ( container != null ) // No container with the description passed on the request exists
    {
      var promise = new Promise(function (resolve, reject)
      {
        exec("./public/bash/che_helper_functions.sh start " + container.registration_ID,
          function (err, stdout, stderr) {
            resolve({response: stdout});
          });
      }).then(function (data) {
        var temp_response = data.response.replace('\n', "");
        res.send({ response: temp_response });
      });
    }
    else
    {
      res.send({error: "The container doesn't exist"});
    }
  }).catch(function(error)
  {
    res.send({ error: error.errors });
  });
});


//Creates a container
router.post('/containers', function (req, res, next)
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
    db.Container.create
    ({
      port: new_container_port_value,
      registration_ID: req.body.registration_id,
      name: req.body.name
    }).then(function ()
    {
      var promise = new Promise(function(resolve,reject)
      {
        exec("./public/bash/che_helper_functions.sh create " + req.body.registration_id + " " + new_container_port_value,
          function(err,stdout,stderr)
          {
            console.log(stdout);
            resolve({ status: stdout });
          });
      }).then(function(data)
      {
        console.log(data);
        res.status(201);
        res.send({ response: data});
      });
    });
  }).catch( function(err)
  {
    res.status(400);
    res.send({ error: err.errors });
    res.end();
  });
});

/*
  It creates a container, both in the database and a container named after the user registration_ID.
  The creation of the registration_ID is left to nginx server block that is listening on port 8082.
 */

router.delete('/containers/:registration_id/stop', function (req, res, next)
{
  db.Container.findOne
  ({
    where: { registration_ID: req.params.registration_id }
  }).then( function(container)
  {
    var promise = new Promise(function(resolve,reject)
    {
      exec("./public/bash/che_helper_functions.sh stop " + container.registration_ID,
        function(err,stdout,stderr)
        {
          resolve({response:stdout});
        });
    }).then( function(data)
    {
      var temp = data.response.replace('\n', "");
      if( temp == "Success") {
        res.status(204);
        res.send();
      }
      else
      {
        res.status(500);
        console.log(data.response);
        res.send({error: temp });
      }
    });
  });
});

router.delete('/containers/:registration_id/delete', function(req,res,next)
{
  db.Container.findOne
  ({
    where: { registration_ID: req.params.registration_id }
  }).then( function(container)
  {
    container.destroy({force: true}).on('success',function(msg)
    {
      var promise = new Promise(function (resolve, reject)
      {
        exec("./public/bash/che_helper_functions.sh delete " + container.registration_ID,
          function(err,stdout,stderr)
          {
            resolve({ response: stdout });
          });
      }).then(function(data)
      {
        var temp = data.response.replace('\n', "");
        res.send({ result: temp });
      });
    });
  });
});

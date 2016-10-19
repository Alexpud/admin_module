const exec = require('child_process').exec;
var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/api', router);
};

router.get('/test', function(req, res, next)
{
  db.Container.findOne({where: { registration_ID: "201110005302" }}).then(function(container)
  {
   var promise = new Promise(function(resolve,reject)
   {
      exec('curl -sb -H "Accept: application/json" -X GET http://localhost:3000/api/containers/'+container.registration_ID,
        function (err, stdout, stderr) {
          resolve({response: stdout});
        });
    }).then(function(data)
   {
     var response = (JSON.parse(data.response));
     res.send(response.status);
   });
  });
});

/*
 First, it retrieves the containers list from the database then, it uses promises to execute the bash script
 responsible for OS operations with docker, actions like: start, stop, status and create.

 I am using promises because it allows me to wait for all the requests inside the list promises to finish,
 then it executes an action on Promises.all.
 */
router.get('/containers', function(req,res,next)
{
  db.Container.all().then( function(container_list)
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
        container_list[i].setDataValue("status",temp);
      }
      return container_list;
    }).then(function(container_list)
    {
      res.status(200);
      res.send(container_list);
    });
  });
});

//Gets all the workspaces belonging to a container
router.get("/containers/:id", function (req, res, next)
{
  db.Container.findOne
  ({
    include: [{
      model: db.Workspace,
      where: { owner_id: req.params.id }
    }]
  }).then( function(container_workspaces_list)
  {
    if ( container_workspaces_list != null )
    {
      var promise = (new Promise(function (resolve, reject) {
        exec("./public/bash/che_helper_functions.sh status " + container_workspaces_list.registration_ID,
          function (err, stdout, stderr) {
            resolve({status: stdout});
          });
      })).then(function (data)
      {
        container_workspaces_list.setDataValue("status", data.status);//.status = data.status;
        res.status(200);
        res.send((container_workspaces_list));
      });
    }
    else
    {
      res.status(404);
      res.end({ Error: "The container doesn't have any workspace" });
    }
  }).catch(function (error)
  {
    res.status(404);
    res.send({ Error: "The container doesn't exist" });
  });
});

/*
 It creates a container, both in the database and a container named after the user registration_ID.
 The creation of the container on the system is made using a bash script placed on public.
 */

router.post('/containers', function (req, res, next)
{
  var new_container_port_value = 0;
  // Returns a list ordered by the container port in descending order.
  db.Container.findAll({limit: 1, order: [['port', 'DESC']]}).then(function (container_list) {
    if (container_list.length == 0) {
      new_container_port_value = 8090;
    }
    else //Grabs the biggest value, increase it by one
    {
      new_container_port_value = container_list[0].port + 1;
    }
  }).then(function ()
  {
    var promise = new Promise(function (resolve, reject)
    {
      exec("./public/bash/che_helper_functions.sh create " + req.body.registration_id + " " + new_container_port_value,
        function (err, stdout, stderr)
        {
          resolve({ response: stdout });
        });
    }).then(function (data)
    {
      if( data.error != null)
      {
        res.status(500);
        res.send({Error: data.response});
      }
      if( data.response == "Container exists")
      {
        res.status(409);
        res.send({ error: "Container already exists" });
      }
      else {
        db.Container.create
        ({
          port: new_container_port_value,
          registration_ID: req.body.registration_id,
          name: req.body.name
        }).then(function () { // Container created
          res.status(201);
          res.send();
        }).catch(function (err) { // Failed to create the container, failed on some restraint
          res.status(409);
          res.send({error: err.errors});
        });
      }
    }).catch(function (error)
    {
      res.status(500);
      res.send({error: error});
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
      }).then(function (data)
      {
        //If it is an error message, docker error message will begin with Error, so the first letter is E
        if(data.response.charAt(0) == 'E')
        {
          var temp_response = data.response.replace('\n', "");
          res.status(404);
          res.send({ response: temp_response });
        }
        else {
          var temp_response = data.response.replace('\n', "");
          res.status(204);
          res.send();
        }
      });
    }
    else
    {
      res.status(404);
      res.send({ error: "The container doesn't exist" });
    }
  }).catch(function(error)
  {
    res.status(404);
    res.send({ error: error.errors });
  });
});

router.delete('/containers/:registration_id/stop', function (req, res, next)
{
  db.Container.findOne
  ({
    where: { registration_ID: req.params.registration_id }
  }).then( function(container)
  {
    if (container != null) {
      var promise = new Promise(function (resolve, reject) {
        exec("./public/bash/che_helper_functions.sh stop " + container.registration_ID,
          function (err, stdout, stderr) {
            resolve({response: stdout});
          });
      }).then(function (data) {
        var temp = data.response.replace('\n', "");
        if (temp == "Success") {
          res.status(204);
          res.send();
        }
        else {
          res.status(500);
          console.log(data.response);
          res.send({error: temp});
        }
      });
    }
    else
    {
      res.status(404);
      res.send({ Error: "Container does not exist" });
    }
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

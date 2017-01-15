const exec = require('child_process').exec;
var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models'),
  passport = require('passport'),
  jwt = require('jsonwebtoken'),
  db = require('../models');
module.exports = function (app) {
  app.use('/api', router);
};

router.get('/test', function(req,res)
{
  db.Container.all({
    where:{
      name: "201110005302"
    },
    include: [{model: db.Workspace}]
  }).then(function(containerList){
    res.send(containerList);
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
  var newContainerList = [];
  var promises = [];
  var containerStatus = "";
  var workspaceStatus = "";
  var temp = 0;
  db.Container.all
  ({
    include: [{ model: db.Workspace }]
  }).then( function(containerList)
  {
    for (var i = 0; i < containerList.length; i++)
    {
      promises.push(new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh container_status " + containerList[i].name,
          function(err, stdout, stderr)
          {
            resolve({ containerStatus: stdout });
          });
      }));

      if(containerList[i].Workspaces.length > 0)
      {
        for( var j = 0; j < containerList[i].Workspaces.length; j ++)  //For each workspace belonging to the container, get it's status
        {
          promises.push(new Promise(function (resolve, reject) {
            exec("./app/helpers/che_helper_functions.sh workspace_status " + containerList[i].Workspaces[j].workspaceID,
              function (err, stdout, stderr) {
                console.log(stdout);
                resolve({workspaceStatus: stdout});
              });
          }));
        }
      }
    }
    Promise.all(promises).then(function (allData)
    {
      for(var i = 0; i < containerList.length;i++)
      {
        containerStatus = allData[temp++].containerStatus.replace('\n', "");
        containerList[i].setDataValue("status",containerStatus);

        if(containerList[i].Workspaces.length > 0) {
          for (var j = 0; j < containerList[i].Workspaces.length; j++) //Add the workspace status to all workspaces belonging to each container
          {
            workspaceStatus = allData[temp++].workspaceStatus.replace('\n', "");
            containerList[i].Workspaces[j].setDataValue("status", workspaceStatus);
          }
        }
      }
      return containerList;
    }).then(function(containerList)
    {
      res.status(200);
      res.send(containerList);
    });
  }).catch(function(error)
  {
    res.status(500);
    res.send({error: error});
  });
});

//Gets all the workspaces belonging to a container
router.get("/containers/:name/", function (req, res, next)
{
  var promises = [];
  var promise;
  db.Container.findOne
  ({
    where:{ name: req.params.name },
    include: [{ model: db.Workspace }]
  }).then( function(container)
  {
    if ( container != null )
    {
      promise = (new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh container_status " + container.name,
          function (err, stdout, stderr)
          {
            resolve({status: stdout});
          });
      })).then(function (data)
      {
        var response = data.status.replace('\n', "");
        container.setDataValue("status", response);//.status = data.status;

      }).then(function()
      {

        for (var i = 0; i < container.Workspaces.length; i++)
        {
          promises.push(new Promise(function (resolve, reject)
          {
            exec("./app/helpers/che_helper_functions.sh workspace_status " + container.Workspaces[i].workspaceID,
              function (err, stdout, stderr) {
                resolve({workspaceStatus: stdout});
              });
          }));
        }

        Promise.all(promises).then(function(allData)
        {
          console.log(allData);
          for(var i = 0; i < container.Workspaces.length; i++)
          {
            var workspaceStatus = allData[i].workspaceStatus.replace('\n', "");
            container.Workspaces[i].setDataValue("status", workspaceStatus);
          }
          return container;
        }).then(function(container)
        {
          console.log("loa");
          res.status(200);
          res.send(container);
        });
      });
    }
    else
    {
      res.status(404);
      res.end({ error: "The container doesn't have any workspace" });
    }
  }).catch(function (error)
  {
    res.status(404);
    res.send({ error: "The container doesn't exist" });
  });
});

/*
 It creates a container, both in the database and a container named after the user registration_ID.
 The creation of the container on the system is made using a bash script placed on public.
 */

router.post('/containers/:name', function (req, res, next)
{
  var new_container_port_value = 0;
  // Returns a list ordered by the container port in descending order.
  db.Container.findAll({limit: 1, order: [['port', 'DESC']]}).then(function (containerList)
  {
    if (containerList.length == 0)
    {
      new_container_port_value = 8090;
    }
    else //Grabs the biggest value, increase it by one
    {
      new_container_port_value = containerList[0].port + 1;
    }
  }).then(function ()
  {
    var promise = new Promise(function (resolve, reject)
    {
      exec("./app/helpers/che_helper_functions.sh create " + req.params.name + " " + new_container_port_value,
        function (err, stdout, stderr)
        {
          resolve({ response: stdout });
        });
    }).then(function (data)
    {
      var response = data.response.replace('\n', "");
      if(response == "Success")
      {
        db.Container.create
        ({
          port: new_container_port_value,
          name: req.params.name,
          UserLogin: req.params.name
        }).then(function () // Container created
        {
          res.status(201);
          res.send();
        }).catch(function (err)  // Failed to create the container, failed on some restraint
        {
          res.status(409);
          res.send({ error: err.errors });
        });
      }
      else if( response == "Error: Container already exists")
      {
        res.status(409);
        res.send({ error: "Container already exists" });
      }
      else
      {
        res.status(500);
        res.send({ error: response });
      }
    }).catch(function (error)
    {
      res.status(500);
      res.send({ error: error });
    });
  });

});

router.post('/containers/:name/start', function(req, res, next)
{
  db.Container.findOne
  ({
    where: { name: req.params.name }
  }).then(function(container)
  {
    if ( container != null ) // No container with the description passed on the request exists
    {
      console.log(container.name);
      var promise = new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh start " + container.name,
          function (err, stdout, stderr) {
            resolve({response: stdout});
          });
      }).then(function (data)
      {
        var response = data.response.replace('\n', "");
        //If it is an error message, docker error message will begin with Error, so the first letter is E
        if(response == "Success")
        {
          res.status(204);
          res.send();
        }
        else
        {
          res.status(404);
          res.send({ error: response });
        }
      }).catch(function(error)
      {
        res.status(500);
        res.send({ error: error });
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

router.delete('/containers/:name/stop', function (req, res, next)
{
  console.log("STOP");
  db.Container.findOne
  ({
    where: { name: req.params.name }
  }).then( function(container)
  {
    console.log(container);
    if (container != null)
    {
      console.log(container);
      var promise = new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh stop " + container.name,
          function (err, stdout, stderr) {
            resolve({response: stdout});
          });
      }).then(function (data)
      {
        var response = data.response.replace('\n', "");
        if ( response == "Success" )
        {
          res.status(204);
          res.send();
        }
        else
        {
          res.status(500);
          res.send({ error: response });
        }
      });
    }
    else
    {
      res.status(404);
      res.send({ error: "Container does not exist" });
    }
  });
});

router.delete('/containers/:name/delete', function(req,res,next)
{
  db.Container.findOne
  ({
    where: { name: req.params.name }
  }).then( function(container)
  {
    container.destroy({ force: true }).on('success', function(msg)
    {
      var promise = new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh delete " + container.name,
          function(err,stdout,stderr)
          {
            resolve({ response: stdout });
          });
      }).then(function(data)
      {
        var response = data.response.replace('\n', "");
        if(response == "Success")
        {
          res.status(204);
          res.send();
        }
        else
        {
          res.status(500);
          res.send({ error: response });
        }
      });
    });
  });
});

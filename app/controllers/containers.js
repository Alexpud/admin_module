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
  var token = jwt.sign({user:"ada"}, "ilovescotchyscotch", {
    expiresIn : "5m" // expires in 24 hours
  });

  // return the information including token as JSON
  res.json
  ({
    success: true,
    message: 'Enjoy your token!',
    token: token
  });
  res.send();
});


/*
 First, it retrieves the containers list from the database then, it uses promises to execute the bash script
 responsible for OS operations with docker, actions like: start, stop, status and create.

 I am using promises because it allows me to wait for all the requests inside the list promises to finish,
 then it executes an action on Promises.all.
 */
router.get('/containers', function(req,res,next)
{
  var new_container_list = [];
  var promises = [];
  db.Container.all().then( function(container_list)
  {
    for (var i = 0; i < container_list.length; i++)
    {
      promises.push(new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh status " + container_list[i].name,
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
        temp = allData[i].status.replace('\n', "");
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
router.get("/containers/:name/", function (req, res, next)
{
  db.Container.findOne
  ({
    name: req.params.name
  }).then( function(container)
  {
    if ( container != null )
    {
      var promise = (new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh status " + container.name,
          function (err, stdout, stderr)
          {
            resolve({status: stdout});
          });
      })).then(function (data)
      {
        var response = data.status.replace('\n', "");
        container.setDataValue("status", response);//.status = data.status;
        res.status(200);
        res.send(container);
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
  db.Container.findAll({limit: 1, order: [['port', 'DESC']]}).then(function (container_list)
  {
    if (container_list.length == 0)
    {
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
  db.Container.findOne
  ({
    where: { name: req.params.name }
  }).then( function(container)
  {
    if (container != null)
    {
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
          res.send({ result: temp });
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

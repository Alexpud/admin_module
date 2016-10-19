const exec = require('child_process').exec;
var workspace_creation = require('../../public/js/workspace_helper');
var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/api', router);
};

//Returns an array of jsons containing the tuples of workspace table
router.get('/workspaces', function (req, res, next)
{
  db.Workspace.findAll( {raw:true} ).then( function (workspace_list)
  {
    res.status(200);
    res.send(workspace_list);
  });
});

router.post('/workspaces', function( req, res, next)
{
  var workspace_name = req.body.workspace_name;
  var workspace_stack = req.body.workspace_stack;
  var owner_id = req.body.owner_id;
  var workspace_id = "";
  var x = "";

  db.Container.findOne({
    where: { registration_ID: owner_id }
  }).then(function (container)
  {
    if ( container != null )
    {
      //Makes a get request to the API to check if the container is running
      var promise = new Promise(function(resolve,reject)
      {
        exec('curl -sb -H "Accept: application/json" -X GET http://localhost:3000/api/containers/'+container.registration_ID,
          function (err, stdout, stderr) {
            resolve({response: stdout});
          });
      }).then(function(data)
      {
        //It returns a container JSON with it's workspaces.
        var response = (JSON.parse(data.response));
        if (response.status == "Running")
        {
          var promise = new Promise(function (resolve, reject) {
            var port = container.port;
            var options =
            {
              host: "localhost",
              port: port,
              path: '/api/workspace?account=&attribute=stackId:' + workspace_stack,
              method: 'POST',
              headers: {'Content-Type': 'application/json'}
            };

            // Creates the request
            var req = http.request(options, function (res) {
              res.on('data', function (chunk) {
                resolve({response: chunk});
                var temp = JSON.parse(chunk);
                workspace_id = temp.id;
              });
            });
            var workspace_helper = new workspace_creation(workspace_stack);
            workspace_helper.setWorkspaceName(workspace_name);
            req.write(JSON.stringify(workspace_helper.model));
            req.end();
          }).then(function (data)
          {
            db.Workspace.create
            ({
              owner_ID: owner_id,
              workspace_name: workspace_name,
              workspace_id: workspace_id,
              stack: workspace_stack,
              ContainerRegistrationID: owner_id
            }).then(function () {
              res.status(201);
              res.send({response: "Workspace was successfully created"});
            }).catch(function (error) {
              res.status(409);
              res.send({response: {error: error.errors}});
            });
          });
        }
        else
        {
          res.status(500);
          res.send({Error: "Container must be running"});
        }
      });
    }
    else
    {
      res.status(404);
      res.send({ error: "The container doesn't exist" });
    }
  });
});


/*
  It receives a workspace_name, it will search for it in the database. If it is found, it will attempt
  to start the workspace
 */
router.post('/workspaces/:workspace_name', function( req, res, next)
{
  db.Workspace.findOne({
    where: { workspace_name: req.params.workspace_name},
    include: [{ model: db.Container,
      where: { registration_ID: req.body.owner_id }
    }]
  }).then( function (workspace)
  {
    if( workspace != null )
    {
      var container_port = workspace.Container.port;
      var promise = new Promise(function (resolve, reject) {
        exec('curl -H "Content-Type: application/json" --data "" -X "POST"  http://localhost:' + container_port + '/api/workspace/' + workspace.workspace_id + '/runtime?environment=default',
          function (err, stdout, stderr) {
            resolve({response: stdout});
          });
      }).then(function (data) {
        //When the operation is successful, CHE api returns a message with an empty body.
        if (data.response.length == 0) {
          res.status(204);
        }
        //When it fails, the message body contains the error message.
        else {
          res.send({response: {error: data.response}});
        }
      });
    }
    else
    {
      res.status(404);
      res.send({ error: "Workspace not found" });
    }
  });
});

router.get('/test', function (req,res,next)
{
  db.Container.findOne({where:{registration_ID: "201110005302"}}).then(function(workspace)
  {
    res.send(workspace.getWorkspaces());
  })
});

router.delete('/workspaces/stop', function(req,res,next)
{
  db.Workspace.findOne({
    where: { workspace_name: req.body.workspace_name },
    include: [{ model: db.Container,
      where: { registration_ID: req.body.owner_id }
    }]
  }).then(function(workspace)
  {
    var promise = new Promise(function (resolve, reject)
    {
      var container_port = workspace.Container.port;
      exec('curl -H "Content-Type: application/json" -X "DELETE" http://localhost:'+container_port+'/api/workspace/'+workspace.workspace_id+'/runtime',
        function(err,stdout,stderr)
        {
          resolve({ response: stdout  });
        });
    }).then(function (data)
    {
      if(data.response.length == 0)
      {
        res.send({ result: "Workspace was successfully stopped" });
      }
      else
      {
        res.send(500);
        res.send({result: { error: data.response } });
      }
    });
  });
});

/*
  It searches in the database for the the workspace, checks if the container that hosts the workspace
   is on, if it is it will send a request do deleete the workspace. If it isn't, it will do nothing.
 */

router.delete('/workspaces/delete',function(req, res, next)
{
  var promise = new Promise(function (resolve, reject)
  {
    exec("./public/bash/che_helper_functions.sh status " + req.body.owner_id,
      function(err,stdout,stderr)
      {
        resolve({status:stdout});
      });
  }).then(function(data)
  {
    //The message retrieved from the bash script comes with \n in the the message, the operation bellow removes it
    var status = data.status.replace('\n', "");
    if(status  == "Running")
    {
      db.Workspace.findOne({
        where: { workspace_name: req.body.workspace_name },
        include: [{ model: db.Container,
          where: { registration_ID: req.body.owner_id }
        }]
      }).then(function(workspace)
      {
        if(workspace != null )
        {
          var promise = new Promise(function (resolve, reject) {
            var container_port = workspace.Container.port;
            exec('curl -H "Content-Type: application/json" -X "DELETE" http://localhost:' + container_port + '/api/workspace/' + workspace.workspace_id,
              function (err, stdout, stderr) {
                resolve({response: stdout});
              });
          }).then(function (data) {
            //If the response length is zero, it means the DELETE action was successful
            if (data.response.length == 0) {
              res.send({result: "Workspace was successfully deleted"});
              workspace.destroy();
            }
            else {
              res.send({result: { error: data.response }});
            }
          });
        }
        else
        {
          res.status(404);
          res.send({ error: "Workspace not found" });
        }
         //Error when searching
      }).catch(function(error)
      {
        res.send(500);
        res.send({ result: { error: error }});
      });
    }
    //Container is not running
    else
    {
      res.send(500);
      res.send({ result: allData[0] });
    }
  });
});


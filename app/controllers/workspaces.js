const exec = require('child_process').exec;
var workspace_creation = require('../helpers/workspace_helper');
var http = require('http');
var express = require('express'),
  request = require('request'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/api', router);
};

//Returns an array of jsons containing the tuples of workspace table
router.get('/workspaces', function (req, res, next)
{
  var newWorkspaceList = [];
  var promises = [];
  db.Workspace.all
  ({
    include: [{ model: db.Container }]
  }).then( function(workspaceList)
  {
    for (var i = 0; i < workspaceList.length; i++)
    {
      promises.push(new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh workspace_status " + workspaceList[i].workspace_id,
          function(err, stdout, stderr)
          {
            resolve({ status: stdout });
          });
      }));

      promises.push(new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh container_status " + workspaceList[i].Container.name,
          function(err, stdout, stderr)
          {
            resolve({ container_status: stdout });
          });
      }));
    }
    Promise.all(promises).then(function (allData)
    {
      for(var i = 0; i < workspaceList.length; i++)
      {
        var workspace_status = allData[i].status.replace('\n', "");
        var container_status = allData[i+1].container_status.replace('\n', "");
        workspaceList[i].setDataValue("status",workspace_status);
        workspaceList[i].Container.setDataValue("status",container_status);
      }
      return workspaceList;
    }).then(function(workspaceList)
    {
      res.status(200);
      res.send(workspaceList);
    });
  });
});

//Creates a workspace
router.post('/workspaces/:workspaceName', function( req, res, next)
{
  var workspaceName = req.params.workspaceName;
  var workspaceStack = req.body.workspaceStack;
  var containerName = req.body.containerName;

  db.Container.findOne
  ({
    where: { name: containerName }
  }).then(function (container)
  {
    if ( container != null )
    {
      //Makes a get request to the API to check if the container is running
      var promise = new Promise(function(resolve,reject)
      {
        exec('curl  -H "Accept: application/json" -X GET http://localhost:3000/api/containers/'+container.name+'/',
          function (err, stdout, stderr) {
            resolve({response: stdout});
          });
      }).then(function(data)
      {
        //It returns a container JSON with it's workspaces.
        var response = (JSON.parse(data.response));
        if (response.status == "Running")
        {
          var promise = new Promise(function (resolve, reject)
          {
            var workspace_helper = new workspace_creation(workspaceStack);
            workspace_helper.setWorkspaceName(workspaceName);
            request
            ({
              url: 'http://localhost:'+container.port+'/api/workspace?account=&attribute=stackId:'+workspaceStack,
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              json: workspace_helper.model
            }, function(error,response,body)
            {
              resolve({data:response.body.id});
            });
          }).then(function (response)
          {
            var workspace_id = response.data;
            if(workspace_id == "")
            {
              res.status(500);
              res.send({ error: "Was not able to create workspace" });
            }
            else
            {
              db.Workspace.create
              ({
                containerName: containerName,
                workspaceName: workspaceName,
                workspace_id: workspace_id,
                stack: workspaceStack
              }).then(function ()
              {
                res.status(204);
                res.send();
              }).catch(function (error)
              {
                res.status(409);
                res.send({ error: error });
              });
            }
          });
        }
        else
        {
          res.status(500);
          res.send({ Error: "Container must be running" });
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
  It receives a workspaceName, it will search for it in the database. If it is found, it will attempt
  to x the workspace
 */
router.post('/workspaces/:workspaceName/start', function( req, res, next)
{
  db.Workspace.findOne
  ({
    where: { workspaceName: req.params.workspaceName},
    include: [{ model: db.Container,
      where: { name: req.body.containerName }
    }]
  }).then( function (workspace)
  {
    if( workspace != null )
    {
      var containerPort = workspace.Container.port;
      var promise = new Promise(function (resolve, reject)
      {
        exec('curl -H "Content-Type: application/json" --data "" -X "POST"  http://localhost:' + containerPort + '/api/workspace/' + workspace.workspace_id + '/runtime?environment=default',
          function (err, stdout, stderr)
          {
            resolve({response: stdout});
          });
      }).then(function (data) {
        //When the operation is successful, CHE api returns a message with an empty body.
        if (data.response.length == 0) {
          res.status(204);
          res.send();
        }
        //When it fails, the message body contains the error message.
        else {
          res.status(500);
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


router.delete('/workspaces/:workspaceName/stop', function(req,res,next)
{
  db.Workspace.findOne
  ({
    where: { workspaceName: req.params.workspaceName },
    include: [{
      model: db.Container,
      where: { name: req.body.containerName }
    }]
  }).then(function(workspace)
  {
    var promise = new Promise(function (resolve, reject)
    {
      var containerPort = workspace.Container.port;
      exec('curl -H "Content-Type: application/json" -X "DELETE" http://localhost:'+containerPort+'/api/workspace/'+workspace.workspace_id+'/runtime',
        function(err,stdout,stderr)
        {
          resolve({ response: stdout  });
        });
    }).then(function (data)
    {
      if(data.response.length == 0)
      {
        res.status(200);
        res.send({ result: "Workspace was successfully stopped" });
      }
      else
      {
        res.status(500);
        res.send({ error: data.response });
      }
    });
  }).catch(function(error)
  {
    res.send(500);
    res.send({ error: error });
  });
});

/*
  It searches in the database for the the workspace, checks if the container that hosts the workspace
   is on, if it is it will send a request do deleete the workspace. If it isn't, it will do nothing.
 */

router.delete('/workspaces/:workspaceName/delete',function(req, res, next)
{
  db.Workspace.findOne
  ({
    where: { workspaceName: req.params.workspaceName },
    include: [{
      model: db.Container,
      where: { name: req.body.containerName }
    }]
  }).then(function(workspace)
  {
    if( workspace != null)
    {
      var promise = new Promise(function (resolve, reject)
      {
        exec("./app/helpers/che_helper_functions.sh container_status " + workspace.Container.name,
          function (err, stdout, stderr) {
            resolve({status: stdout});
          });
      }).then(function (data)
      {
        //The message retrieved from the bash script comes with \n in the the message, the operation bellow removes it
        var status = data.status.replace('\n', "");
        if (status == "Running")
        {
          // If a workspace with the data passed was found.
          if (workspace != null)
          {
            var promise = new Promise(function (resolve, reject)
            {
              var containerPort = workspace.Container.port;
              exec('curl -H "Content-Type: application/json" -X "DELETE" http://localhost:' + containerPort + '/api/workspace/' + workspace.workspace_id,
                function (err, stdout, stderr) {
                  resolve({ response: stdout });
                });
            }).then(function (data)
            {
              //If the response length is zero, it means the DELETE action was successful
              if (data.response.length == 0)
              {
                res.status(204);
                workspace.destroy();
                res.send();
              }
              else
              {
                res.status(500);
                res.send({ error: data.response });
              }
            });
          }
          else {
            res.status(409);
            res.send({ error: "Workspace not found" });
          }
          //Error when searching
        }
        //Container is not running
        else {
          res.status(500);
          res.send({ error: data.status });
        }
      });
    }else
    {
      res.status(409);
      res.send({Error:"Workspace not found"});
    }
  }).catch(function (error) {
    res.status(500);
    res.send({ error: error });
  });
});


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

router.post('/workspaces/create', function( req, res, next)
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
    if ( container != null ) {
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
      }).then(function (data) {
        x = data;
        db.Workspace.create({
          owner_ID: owner_id,
          workspace_name: workspace_name,
          workspace_id: workspace_id,
          stack: workspace_stack,
          ContainerRegistrationID: owner_id
        }).then(function () {
          res.send({response: "Workspace was successfully created"});
        }).catch(function (error) {
          res.send({response: {error: error.errors}});
        });
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
  It receives a workspace_id, since i don't have access to authentication at the moment, i used a default value.
  Then, it sends a request with this workspace name to the che instance.
  Again, the port of the che instance is defaulted to 8098 because of tests.
 */


router.post('/workspaces/start', function( req, res, next)
{
  db.Workspace.findOne({
    where: { workspace_name: req.body.workspace_name },
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
          res.send({response: "Workspace was successfully started"});
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

router.delete('/workspace/stop', function(req,res,next)
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


router.delete('/workspace/delete',function(req, res, next)
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
              res.send({result: {error: data.response}});
            }
          });
        }
        else
        {
          res.status(400);
          res.send({error: "Workspace not found"});
        }
      }).catch(function(error)
      {
        res.send(500);
        res.send({ result: { error:error }});
      });
    }
    else
    {
      res.send(404);
      res.send({result:allData[0]});
    }
  });
});


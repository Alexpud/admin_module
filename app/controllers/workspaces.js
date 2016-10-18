var workspace_creation = require('../../public/js/workspace_helper');
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

//Returns an array of jsons containing the tuples of workspace table
router.get('/workspace/list', function (req, res, next)
{
  db.Workspace.findAll( {raw:true} ).then( function (workspace_list)
  {
    res.send(workspace_list);
  });
});

router.get('/list/workspaces&containers/:id', function ( req, res, next)
{
  db.Workspace.findAll
  ({
    where:
    {
      "owner_id":"201110005300"
    },
    include: [{
      model: db.Container,
      where: { registration_ID: req.params.id }
    }]

  }).then(function(result)
  {
    res.send(result);
  });
});


router.post('/workspace/create', function( req, res, next)
{
  var workspace_name = req.body.workspace_name;
  var workspace_stack = req.body.workspace_stack;
  var workspace_image = req.body.workspace_image;
  var owner_id = req.body.owner_id;
  var workspace_id = "";

  db.Container.findOne({
    where: { registration_ID: owner_id }
  }).then(function (container)
  {
    var port = container.port;
    var options =
    {
        host: "192.168.25.10",
        port: port,
        path: '/api/workspace?account=&attribute=stackId:'+workspace_stack,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      // Creates the request
      var req = http.request(options, function(res)
      {
        res.on('data', function (chunk) {
          var temp = JSON.parse(chunk);
          var workspace_id = temp.id;
          create_workspace(owner_id,workspace_name,workspace_id,workspace_stack);
        });
      });
      var workspace_helper= new workspace_creation(workspace_stack);
      workspace_helper.setWorkspaceName(workspace_name);
      req.write(JSON.stringify(workspace_helper.model));
      req.end();
  });
  res.end();
});

/*
  It receives a workspace_id, since i don't have access to authentication at the moment, i used a default value.
  Then, it sends a request with this workspace name to the che instance.
  Again, the port of the che instance is defaulted to 8098 because of tests.
 */


router.post('/workspace/start', function( req, res, next)
{
  db.Workspace.findOne({
    where:
    {
      workspace_name: req.body.workspace_name
    },
    include: [{ model: db.Container,
      where: { registration_ID: req.body.owner_id }
    }]
  }).then( function (workspace)
  {
    var container_port = workspace.Container.port;
    var promise = new Promise(function (resolve, reject) {
      exec('curl -H "Content-Type: application/json" --data "" -X "POST"  http://localhost:' + container_port + '/api/workspace/'+workspace.workspace_id+'/runtime?environment=default',
        function (err, stdout, stderr) {
          resolve({response: stdout});
        });
    }).then(function(data)
    {
      if(data.response.length == 0)
      {
        res.send({result:"Workspace was successfully started"});
      }
      else
      {
        res.send({result: data.response});
      }
    });
  });
});

router.delete('/workspace/stop', function(req,res,next)
{
  db.Workspace.findOne({
    where:
    { workspace_name: req.body.workspace_name },
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
          resolve({response:stdout});
        });
    }).then(function (data)
    {
      if(data.response.length == 0)
      {
        res.send({result:"Workspace was successfully stopped"});
      }
      else
      {
        res.send({result: data.response});
      }
    });
    //request_helper.make_request("DELETE","localhost",workspace.Container.port,"/api/workspace/"+workspace.workspace_id+"/runtime","");
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
    var status = data.status.replace('\n', "");
    if(status  == "Running")
    {
      db.Workspace.findOne({
        where:
        { workspace_name: req.body.workspace_name },
        include: [{ model: db.Container,
          where: { registration_ID: req.body.owner_id }
        }]
      }).then(function(workspace)
      {
        var promise = new Promise(function (resolve, reject)
        {
          var container_port = workspace.Container.port;
          exec('curl -H "Content-Type: application/json" -X "DELETE" http://localhost:'+container_port+'/api/workspace/'+workspace.workspace_id,
            function(err,stdout,stderr)
            {
              resolve({response:stdout});
            });
        }).then(function (data)
        {
          if(data.response.length == 0)
          {
            res.send({result:"Workspace was successfully deleted"});
            workspace.destroy();
          }
          else
          {
            res.send({result:data.response});
          }
        });
      });
    }
    else
    {
      res.send({"error":allData[0]});
    }
  });
});

/*
  It first creates teh workspace in the database, then it sends a request to a specific port where nginx
  will be listening, and when it receives a request it tries to start a container with the name on the uri
  passed. With the name passed on the uri, nginx will try to find on the workspace database a tuple with the
  same name and from that tuple, extract the port where the container will run.
 */

function create_workspace(registration_id,workspace_name,workspace_id,workspace_stack)
{
  db.Workspace.findOrCreate(
    {
      where:
      {
        owner_ID: registration_id,
        workspace_name: workspace_name,
        workspace_id: workspace_id,
        stack: workspace_stack,
        ContainerRegistrationID: registration_id
      }
    }
  ).then(function()
    {
      console.log("sucess");
    }
  );
}


var workspace_creation = require('../../public/js/workspace_helper');
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
        host: 'localhost',
        port: port,
        path: '/api/workspace?account=&attribute=stackId:'+workspace_stack,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      // Creates the request
      var req = http.request(options, function(res)
      {
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
          var temp = JSON.parse(chunk);
          var workspace_id = temp.id;
          create_workspace(owner_id,workspace_name,workspace_id,"cpp-default")
        });
      });
      var workspace_helper= new workspace_creation();
      workspace_helper.setWorkspaceName(workspace_name);
      workspace_helper.setWorkspaceImage('cpp_gcc');
      req.write(JSON.stringify(workspace_helper.model));
      req.end();
      res.end();
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
      workspace_id: req.body.workspace_id,
      include: [{ model: db.Container,
        where: { registration_ID: req.body.owner_id }
      }]
    }
  }).then( function (workspace)
  {
    var promises = [];
    promises.push(new Promise(function(resolve,reject)
    {
      console.log(workspace.registration_ID);
      var options = {
        host: 'localhost',
        port: workspace.Container.port,
        path: '/api/workspace/' + workspace.workspace_id + '/runtime?environment=default',
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      };

      var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          resolve({data:chunk});
        });
      });
      req.write("");
    }));
    Promise.all(promises).then(function(result)
    {
      res.send(result);
    });
  });
  res.end();
});

router.delete('/workspace/delete',function(req, res, next)
{
  var promises = [];
  var result = "";
  promises.push(new Promise(function(resolve,reject)
  {
    var options =
    {
      host: "localhost",
      port: 3000,
      path: "/api/container/status/"+req.body.owner_id,
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

  Promise.all(promises).then(function (allData)
  {
    console.log(allData);
    if(allData.data == "Running")
    {
      db.Workspace.findOne({
        where:
        {
          owner_ID: req.body.owner_id
        },
        include: [{ model: db.Container,
          where: { registration_ID: req.body.owner_id }
        }]
      }).then(function(workspace)
      {
        var container_port = workspace.Container.port;
        request_helper.make_request("delete","localhost",container_port,"/api/workspace/",workspace.workspace_id);
        workspace.destroy({force: true}).on('success',function(msg)
        {
          console.log(msg);
        })
      });
    }
    else
    {
      res.send({"error":allData[0]});
    }
  });

  /*db.Workspace.findOne(
    {
      where:
      {
        owner_ID: req.body.owner_id,
      },
      include: [{model: db.Container, where:
      {
        registration_ID: req.body.owner_id
      }}]
    }).then(function(workspace)
    {
      var container_port = workspace.Container.port;
      request_helper.make_request("delete","localhost",container_port,"/api/workspace/",workspace.workspace_id);

    });*/
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


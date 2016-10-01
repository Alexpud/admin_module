var workspace_creation = require('../../lib/javascript/workspace_helper');
var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/', router);
};

router.get('/workspaces', function (req, res, next) {
  res.render('workspaces');

});

//Creates a workspace
router.post('/workspaces', function(req, res, next)
{
  //According to the documentation, it tries to find the element in the database, if the database is not found,
  //it creates and saves the element.
  var workspace_name = req.body.workspace_name;
  var registration_id = req.body.registration_id;
  var workspace_stack = req.body.stacks;
  /*
    It searches for an already existing entry in the database for the workspace belonging to the user, which
    is identified by it's registration_id.
  */
  db.Workspace
    .findOne(
      {
        where:
        {
          registration_ID: registration_id,
          workspace_name: workspace_name
        }
      })
    .then(function(workspace)
      {
        /* There is no workspace for the user, so we can create an entry for the user in the database and
            create a workspace for him. We will only add the entry after we create the container, because
            the response to the creation of the container, JSON, contains the id of the user container which
            will be useful for further operations.
        */
        if (workspace == null)
        {
          var options = {
            host: '192.168.25.10',
            port: 8098,
            path: '/api/workspace?account=&attribute=stackId:'+workspace_stack,
            method: 'POST',
            headers:
            {
              'Content-Type': 'application/json'
            }
          };

          // Creates the request
          var req = http.request(options, function(res)
          {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.on('data', function (chunk) {
              console.log('BODY: ' + chunk);
              var temp = JSON.parse(chunk);
              var workspace_id = temp.id;
              create_workspace(registration_id,workspace_name,workspace_id)
            });
          });

          var workspace = new workspace_creation();
          workspace.setWorkspaceName(workspace_name);
          workspace.setWorkspaceStack('FROM codenvy/cpp_gcc');
          req.write(JSON.stringify(workspace.model));
          req.end();
          res.end();
        }

        //User already have a workspace
        else
        {
          console.log("workspace already exists");
          res.end();
        }
      });
  res.end();
});

router.post('/workspacess',function(req, res, next)
{
  var options = {
    host: '192.168.25.10',
    port: 8098,
    path: '/api/workspace?account=&attribute=stackId:cpp-default',
    method: 'POST',
    headers:
    {
      'Content-Type': 'application/json'
    }
  };

  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      var test = chunk;
      //console.log('BODY: ' + chunk);
      console.log(chunk.id);
    });
  });

  var workspace = new workspace_creation();
  workspace.setWorkspaceName('cpp_test');
  workspace.setWorkspaceStack('FROM codenvy/cpp_gcc');
  req.write(JSON.stringify(workspace.model));
  req.end();
});

router.post('/test', function( req, res, next)
{
  db.Workspace
    .findOrCreate(
      {
        where: {
          registration_ID: '2011100053s',
          workspace_name: 'tests'
        }
      })
    .spread(function(workspace,created)
    {
      console.log(workspace.get(
        {
          plain:true
        }))
      console.log("created");
    });
});

router.delete('/workspaces',function(req, res, next)
{
});



function create_workspace(registration_id, workspace_name, workspace_id)
{
  db.Workspace
    .findOrCreate(
      {
        where: {
          registration_ID: registration_id,
          workspace_name: workspace_name,
          workspace_id: workspace_id
        }
      });
}

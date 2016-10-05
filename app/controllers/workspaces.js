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
router.post('/create', function(req, res, next)
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
          res.render("workspaces",{});
        }
      });
  res.end();
});
/*
  It receives a workspace_id, since i don't have access to authentication at the moment, i used a default value.
  Then, it sends a request with this workspace name to the che instance.
  Again, the port of the che instance is defaulted to 8098 because of tests.
 */
router.post('/start', function( req, res, next)
{
  db.Workspace.findOne(
    {
      where:
      {
        //It is a sample works
        workspace_id: "workspaceomy4prvny0gism71"
      }
    }
  ).then( function (workspace)
  {
    console.log(workspace.registration_ID);
    var options = {
      host: '192.168.25.10',
      port: 8098,
      path: '/api/workspace/'+workspace.workspace_id+'/runtime?environment=default',
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
        console.log('BODY: ' + chunk);
      });
    });
    req.write("");
    req.end();
    res.end();
  });

});

router.delete('/workspaces',function(req, res, next)
{
});

/*
  It first creates teh workspace in the database, then it sends a request to a specific port where nginx
  will be listening, and when it receives a request it tries to start a container with the name on the uri
  passed. With the name passed on the uri, nginx will try to find on the workspace database a tuple with the
  same name and from that tuple, extract the port where the container will run.
 */

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
      }).then(function()
  {

    var options = {
      host: '192.168.25.10',
      port: 8082,
      path: '/'+registration_id,
      method: 'GET'
    };

    var req = http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });
    req.write("");
    req.end();
  });

}

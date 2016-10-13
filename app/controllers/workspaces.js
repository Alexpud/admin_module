var workspace_creation = require('../../public/js/workspace_helper');

var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/', router);
};

//Returns an array of jsons containing the tuples of workspace table
router.get('/list_workspaces', function (req, res, next)
{
  db.Workspace.findAll( {raw:true} ).then( function (workspace_list)
  {
    res.send(workspace_list);
  });
});

router.get('/create/workspace2', function( req, res, next)
{
  db.Workspace.findAll
  ({
    include: [{model: db.Container }]
  }).then(function(result)
  {
    console.log(result);
    res.send(result);
  });
});

//Creates a workspace
router.post('/create/workspace', function(req, res, next)
{
  //According to the documentation, it tries to find the element in the database, if the database is not found,
  //it creates and saves the element.
  /*var owner_id = req.body.owner_id;
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
          owner_ID: "201110005300",
          workspace_name: "teste"
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
            host: '10.1.1.10',
            port: 8090,
            path: '/api/workspace?account=&attribute=stackId:cpp-default',
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
              create_workspace("201110005300","teste","adasd","cpp-default")
            });
          });
          var workspace_helper= new workspace_creation();
          workspace_helper.setWorkspaceName("teste");
          workspace_helper.setWorkspaceStack('FROM codenvy/cpp_gcc');
          req.write(JSON.stringify(workspace_helper.model));
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
        ContainerRegistrationID: "201110005300"
      }
    }
  ).then(function()
    {
      console.log("sucess");
    }
  );
}


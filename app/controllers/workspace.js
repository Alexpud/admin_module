var workspace_creation = require('../../lib/javascript/workspace_helper');
var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/', router);
};

router.get('/workspace', function (req, res, next) {
  res.render('index',{title:'ola'});
});

router.post('/create',function(req, res, next)
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
      console.log('BODY: ' + chunk);
    });
  });

  var workspace = new workspace_creation();
  workspace.setWorkspaceName('cpp_test');
  workspace.setWorkspaceStack('FROM codenvy/cpp_gcc');
  req.write(JSON.stringify(workspace.model));
  req.end();
});

router.post('/delete',function(req, res, next)
{

});

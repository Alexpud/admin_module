var workspace_creation = require('../jsons/workspace_creation.json');

var http = require('http');
var express = require('express'),
  router = express.Router(),
  db = require('../models');
module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    res.render('index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
  });
});

router.get('/redirect', function(req, res, next)
{
  res.redirect('http://localhost:8098');
});

router.get('/post',function(req, res, next)
{

  var data = {"commands":[
    {
      "commandLine":"cd ${current.project.path} && make && ./a.out",
      "name":"run",
      "type":"custom",
      "attributes":{}
    }],
    "projects":[],
    "environments":[
      {
        "machineConfigs":[
          {
            "source":
            {
              "type":"dockerfile",
              "content":"FROM codenvy/cpp_gcc"
            },
            "servers":[],
            "envVariables":{},
            "dev":true,
            "limits":
            {
              "ram":1000

            },
            "name":"default",
            "type":"docker",
            "links":[]
          }],
        "name":"default"
      }],
    "defaultEnv":"default",
    "name":"test",
    "links":[],
    "description":null
  };

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

  workspace_creation.environments[0].machineConfigs[0].source.content = 'FROM codenvy/cpp_gcc'
  console.log( workspace_creation.environments[0].machineConfigs[0].source.content);
  //req.write(JSON.stringify(workspace_creation));
  //req.end();
});

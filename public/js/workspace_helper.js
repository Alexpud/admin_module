/**
 * Created by boss on 28/09/16.
 */
var model = require('../jsons/workspace_creation.json');
var workspace = function ()
{
  this.model = {"commands":[
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
              "content":"FROM codenvy/"

            },
            "servers":[],
            "envVariables":{},
            "dev":true,
            "limits":
            {
              "ram":512
            },
            "name":"default",
            "type":"docker",
            "links":[]
          }],
        "name":"default"
      }],
    "defaultEnv":"default",
    "name":"Test",
    "links":[],
    "description":null
  };


  this.setWorkspaceName = function(name)
  {
    this.model.name = name;
  };

  this.setWorkspaceImage = function(image)
  {
    this.model.environments[0].machineConfigs[0].source.content = image;
  };
};

module.exports = workspace;

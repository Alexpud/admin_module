/**
 * Created by boss on 28/09/16.
 */
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
              "content":""

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
    "name":"Test",
    "links":[],
    "description":null
  };

  this.setWorkspaceName = function(name)
  {
    this.model.name = name;
  };

  this.setWorkspaceStack = function(stack)
  {
    this.model.environments[0].machineConfigs[0].source.content = stack;
  };
};

module.exports = workspace;

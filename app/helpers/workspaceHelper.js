/**
 * Created by boss on 28/09/16.
 */
var cpp = require('./jsons/cpp-default_workspace_creation.json'),
  java = require('./jsons/java-default_workspace_creation.json');

var workspaceHelper = function (stack){

  switch(stack){
    case 'cpp-default':
      this.model = cpp;
    case 'java-default':
      this.model = java;
  }
  
  console.log(this.model);
  this.setWorkspaceName = function(name)
  {
    this.model.name = name;
  };

  this.setWorkspaceImage = function(image)
  {
    this.model.environments[0].machineConfigs[0].source.content = image;
  };
};

module.exports = workspaceHelper;

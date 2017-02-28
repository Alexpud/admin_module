/**
 * Created by boss on 28/09/16.
 */

var workspace = function (stack){
  this.model = require("./jsons/"+stack+"_workspace_creation.json");
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

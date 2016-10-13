/**
 * Created by boss on 28/09/16.
 */
var model = require('../jsons/workspace_creation.json');
var workspace = function ()
{

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

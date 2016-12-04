'use strict';
angular
  .module('service.workspace')
  .service('Workspace', ['$resource','$log', function($resource,$log)
  {
    var self = this;
    self.Workspace = $resource('http://localhost:3000/api/containers/:containerName/workspaces/:workspaceName/:action',null,
    {
      'start': { method: 'POST' },
      'stop':  { method: 'DELETE' },
      'delete': { method: 'DELETE' },
      'workspaces': {method: 'GET', isArray: true}
    });

    /*
     Executes a action for one of the given workspaces
     */
    self.executeWorkspaceAction = function (action,workspaceName,containerName)
    {
      switch(action)
      {
        case "start":
          self.Workspace.start(
          {
            containerName: containerName,
            workspaceName: workspaceName,
            action: 'start'
          },
          {});
          break;
        case "stop":
          self.Workspace.stop
          ({
            containerName: containerName,
            workspaceName: workspaceName,
            action: 'stop'
          },
          {});
          break;
        case "delete":
          self.Workspace.delete
          ({
            containerName: containerName,
            workspaceName: workspaceName,
            action: 'delete'
          },
          {});
          break;
      }
    };

    self.getWorkspace = function(containerName, workspaceName)
    {
      return self.Workspace.workspaces({ containerName: containerName },{});
    };

    self.workspacesEmpty = function(id)
    {
      /*
       Workaround for the moment. This method was being executed several times, without the loading
       of data. So....
       */
      if(self.containers[id].Workspaces == undefined)
        return true;

      return self.containers[id].Workspaces.length == 0;
    };

  }]);

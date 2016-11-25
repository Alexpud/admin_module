'use strict';
angular
  .module('service.workspace')
  .factory('Workspace', ['$resource','$log', function($resource,$log)
  {
    return $resource('http://localhost:3000/api/containers/:containerName/workspaces/:workspaceName/:action',null,
    {
      'start': { method: 'POST' },
      'stop':  { method: 'DELETE' },
      'delete': { method: 'DELETE' }
    });
  }]);

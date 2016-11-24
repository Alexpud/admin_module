'use strict';
angular
  .module('service.workspace')
  .service('Workspace', ['$http','$log', function($http,$log)
  {
    var self = this;

    self.start = function(workspaceName,containerName)
    {
      return $http
      ({
        method: 'POST',
        url: 'api/workspaces/'+workspaceName+'/start',
        data: { 'containerName': containerName }
      }).then(function(response)
      {
        $log.log(response);
        return response;
      });
    };

    self.stop = function(workspaceName, containerName)
    {
      return $http
      ({
        method: 'DELETE',
        url: 'api/workspaces/'+workspaceName+'/stop',
        data: { 'containerName': containerName },
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        }
      }).then(function(response)
      {
        return response;
      });
    };

    self.delete = function(workspaceName, containerName)
    {
      return $http
      ({
        method: 'DELETE',
        url: 'api/workspaces/'+workspaceName+'/delete',
        data: { 'containerName': containerName },
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        }
      }).then(function(response) {
        $log.log(response);
        return response;
      });
    };

  }]);

'use strict';
angular
  .module('service.container')
  .service('Container',
    ['$resource','$q','responseInterceptor', function($resource,$q,responseInterceptor)
    {
      var self = this;
      var defer = $q.defer();
      self.Container = $resource('http://localhost:3000/api/containers/:containerName/:action',null,
      {
        'getContainer': { method: 'GET', interceptor: responseInterceptor },
        'start': { method: 'POST', interceptor: responseInterceptor },
        'stop': { method: 'DELETE', interceptor: responseInterceptor },
        'delete': { method: 'DELETE', interceptor: responseInterceptor }
      });
      /*
        Uses $q and promises to wait for the API response so that it can return an accurate response and status.
      */
      self.executeContainerAction = function(action,containerName)
      {
        switch(action)
        {
          case "start":
            var result = self.Container.start({ 
              containerName: containerName, 
              action: 'start' 
            },{}).$promise.then(function(response){
              defer.resolve(result);
              return response;
            });
            return defer.promise;
            break;
          case "stop":
            var result = self.Container.stop({ 
              containerName: containerName, 
              action: 'stop'
            },{}).$promise.then(function(response){
              defer.resolve(result);
              return response;
            });
            return defer.promise;
            break;
          case "delete":
            var result = self.Container.delete({ 
              containerName: containerName, 
              action: 'delete'
            },{}).$promise.then(function(response){
              defer.resolve(result);
              return response;
            });
            break;
        }
      };

      self.getAllContainers = function()
      {
        var currentUser = JSON.parse(localStorage.getItem('user'));
        var result = [];
        if (currentUser.admin)
          result = self.Container.query();
        else
          result.push(self.Container.get({containerName: currentUser.name}, {}));
        return result;
      };

    }]);

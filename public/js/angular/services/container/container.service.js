'use strict';
angular
  .module('service.container')
  .service('Container',
    ['$resource', function($resource)
    {
      var self = this;

      self.Container = $resource('http://localhost:3000/api/containers/:containerName/:action',null,
      {
        'getContainer': { method: 'GET' },
        'start': { method: 'POST' },
        'stop': { method: 'DELETE' },
        'delete': { method: 'DELETE' }
      });

      self.executeContainerAction = function(action,containerName)
      {
        console.log("asdasda");
        console.log(action);
        switch(action)
        {
          case "start":
            self.Container.start({ containerName: containerName, action: 'start' },{});
            break;

          case "stop":
            console.log("asdasdasdadsad");
            self.Container.stop({ containerName: containerName, action: 'stop' },{});
            break;

          case "delete":
            self.Container.delete({ containerName: containerName, action: 'delete'},{});
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

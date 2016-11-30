'use strict';
angular
  .module('service.container')
    .factory('Container',
    ['$resource', function($resource)
    {
      return $resource('http://localhost:3000/api/containers/:containerName/:action',null,
      {
        'getContainer': { method: 'GET' },
        'start': { method: 'POST' },
        'stop': { method: 'DELETE' },
        'delete': { method: 'DELETE' }
      });
    }]);

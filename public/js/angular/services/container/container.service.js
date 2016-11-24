'use strict';
angular
  .module('service.container')
    .service('Container',
    ['$resource', function($resource)
    {
      return $resource('http://localhost:3000/api/containers/:containerName/:action',null,
      {
        'start': { method: 'POST' },
        'stop': { method: 'DELETE' },
        'delete': { method: 'DELETE' }
      });
    }]);

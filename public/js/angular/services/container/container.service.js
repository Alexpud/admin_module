'use strict';
angular
  .module('service.container')
    .service('Container',
    ['$resource', function($resource)
    {
      return $resource('http://localhost:3000/api/containers/:id/:action',null,
      {
        'start':
        {
          method: 'POST'
        }
      });
    }]);

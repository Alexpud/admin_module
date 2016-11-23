'use strict';
angular
  .module('service.container')
    .service('Container',
    ['$http','$q',
      function($http,$q)
      {
        this.list = function()
        {
          return $http.get('api/containers').then( function(response) {
            return response;
          });
        }
      }
    ]);

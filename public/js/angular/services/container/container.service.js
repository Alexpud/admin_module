'use strict';
angular
  .module('service.container')
    .service('Container',
    ['$http','$q',
      function($http,$q)
      {
        this.list = function()
        {
          return $http.get('api/containers').success( function(response) {
            return response;
          }).error(function(response,status)
          {
            return response;
          });
        }
      }
    ]);

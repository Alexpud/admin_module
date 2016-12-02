'use strict';
angular.
  module('adminApp').
    config(['$locationProvider', '$routeProvider',
      function config($locationProvider, $routeProvider)
      {

        $routeProvider.
        when('/management', {
          template: '<management-area></management-area>'
        }).
        when('/', {
          template: function()
          {
           // If there is a token on the browser
            if (localStorage.getItem('token'))
            {
              return '<management-area></management-area>';
            }
            else
            {
              return '<login-form></login-form>';
            }
         }

        });
      }
    ]);

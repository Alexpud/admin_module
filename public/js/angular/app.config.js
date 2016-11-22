'use strict';
angular.
  module('adminApp').
    config(['$locationProvider', '$routeProvider',
      function config($locationProvider, $routeProvider)
      {
        $locationProvider.hashPrefix('!');

        $routeProvider.
        when('/management', {
          template: '<management-area></management-area>'
        }).
        when('/containers', {
          template: '<container-list></container-list>'
        }).
        when('/',{
          template: '<login-form></login-form>'
        });

    }
  ]);

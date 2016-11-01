angular.
  module('adminApp').
    config(['$locationProvider', '$routeProvider',
      function config($locationProvider, $routeProvider)
      {
        $locationProvider.hashPrefix('!');

        $routeProvider.
        when('/workspaces', {
          template: '<workspace-list></workspace-list>'
        }).
        when('/containers', {
          template: '<container-list></container-list>'
        }).
        when('/login',{
          template: '<login-form></login-form>'
        });

    }
  ]);

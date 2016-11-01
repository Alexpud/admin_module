angular.module('workspaceList').
  component('workspaceList',
  {
    templateUrl: "js/angular/workspace-list/workspace-list.template.html",
    controller:
      ['$http', '$routeParams',
        function WorkspaceListController($http)
        {
          var self = this;

          $http.get('api/workspaces').then(function (response)
          {
            self.resulting_array = response.data;
          });
        }
      ]
  });


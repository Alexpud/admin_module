'use strict';
angular
  .module('managementArea')
  .component('managementArea',
  {
    controllerAs: 'managementCtrl',
    controller:['Container','$http', '$q',
      function ManagementAreaController(Container,$http,$q)
      {
        var injector = angular.injector(['ng', 'managementArea','services']);
        var self = this;
        var container = injector.get('Container');

        var defferded = $q.defer();


        self.getContainers = function() {
          $http.get('api/containers').then(function (response) {
            self.resulting_array = response.data;
            console.log("asdsada");
          });
        };

        self.getContainers();
        /*
         Action that receives the id of the table containing the workspaces, and toggles the class hidden
         */
        self.hideWorkspaces = function(id)
        {
          var button = angular.element( document.querySelector( '#'+id ) );
          button.toggleClass("hidden");
        };

        /*
         Executes one of the actions for a given container
         */
        self.executeContainerAction = function(action,name)
        {
          switch(action)
          {
            case "start":
              console.log("here");
              break;

            case "stop":
              break;

            case "delete":
              break;
          }
          self.getContainers();
        };

        /*
         Executes a action for one of the given workspaces
         */
        self.executeWorkspaceAction = function (action)
        {
          switch(action)
          {
            case "start":
              break;

            case "stop":
              break;

            case "delete":
              break;
          }
          self.getContainers();
        };
        console.log("asda");
      }
    ],
    templateUrl: "/js/angular/management-area/management-area-template.html"
  });

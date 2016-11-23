'use strict';
angular
  .module('managementArea')
  .component('managementArea',
  {
    controllerAs: 'managementCtrl',
    controller:['Container','$http', '$q','$scope',
      function ManagementAreaController(Container,$http,$q,$scope)
      {
        var injector = angular.injector(['ng', 'managementArea','services']);
        var self = this;

        self.getAllContainers = function()
        {
          self.containers = Container.query();
        };

        self.startContainer = function(id)
        {
        };

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
              Container.start({id:name,action:action},{});
              break;

            case "stop":
              break;

            case "delete":
              break;
          }
          self.getAllContainers();
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
        self.getAllContainers();
      }
    ],
    templateUrl: "/js/angular/management-area/management-area-template.html"
  });

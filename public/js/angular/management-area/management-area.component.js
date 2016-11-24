'use strict';
angular
  .module('managementArea')
  .component('managementArea',
  {
    controllerAs: 'managementCtrl',
    controller:['Container','Workspace','$http', '$q','$scope',
      function ManagementAreaController(Container,Workspace,$http,$q,$scope)
      {
        var injector = angular.injector(['ng', 'managementArea','services']);
        var self = this;

        /*
         Executes one of the actions for a given container
         */
        self.executeContainerAction = function(action,containerName)
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
          self.getAllContainers();
        };

        /*
         Executes a action for one of the given workspaces
         */
        self.executeWorkspaceAction = function (action,workspaceName,containerName)
        {
          switch(action)
          {
            case "start":
              Workspace.start(workspaceName,containerName).then(function(response)
              {
                if(response.data.error)
                {
                  console.log("erro");
                }
              });
              break;

            case "stop":
              Workspace.stop(workspaceName,containerName).then(function(response)
              {
                if(response.data.error)
                {
                  console.log("erro");
                }
                console.log(response);
              });
              break;

            case "delete":
              Workspace.stop(workspaceName,containerName).then(function(response)
              {
                if(response.data.error)
                {
                  console.log("erro");
                }
                console.log(response);
              });
              break;
          }qs
          self.getAllContainers();
        };

        self.getAllContainers = function()
        {
          self.containers = Container.query();
        };

        /*
         Action that receives the id of the table containing the workspaces, and toggles the class hidden
         */
        self.hideWorkspaces = function(id)
        {
          var button = angular.element( document.querySelector( '#'+id ) );
          button.toggleClass("hidden");
        };
        self.getAllContainers();
      }
    ],
    templateUrl: "/js/angular/management-area/management-area-template.html"
  });

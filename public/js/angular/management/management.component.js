'use strict';
angular
  .module('app.managementArea')
  .component('managementArea',
  {
    controllerAs: 'managementCtrl',
    controller:
      ['Container','Workspace','$http', '$q','$scope',
        function ManagementAreaController(Container,Workspace,$http,$q,$scope)
        {
          var injector = angular.injector(['ng', 'app.managementArea','services']);
          var self = this;

          /*
           Executes one of the actions for a given container
           */
          self.executeContainerAction = function(action,containerName)
          {
            switch(action)
            {
              case "start":
                Container.start({ containerName: containerName, action: 'start' },{});
                break;

              case "stop":
                Container.stop({ containerName: containerName, action: 'stop' },{});
                break;

              case "delete":
                Container.delete({ containerName: containerName, action: 'delete'},{});
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
                Workspace.start(
                {
                  containerName: containerName,
                  workspaceName: workspaceName,
                  action: 'start'
                },
                {});
                break;
              case "stop":
                Workspace.stop
                ({
                  containerName: containerName,
                  workspaceName: workspaceName,
                  action: 'stop'
                },
                {});
                break;
              case "delete":
                Workspace.delete(
                {
                  containerName: containerName,
                  workspaceName: workspaceName,
                  action: 'delete'
                },
                {});
                break;
            }
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
      templateUrl: "/js/angular/management/management-template.html"
    });

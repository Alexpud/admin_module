'use strict';
angular
  .module('app.managementArea')
  .component('managementArea',
  {
    templateUrl: "/js/angular/management/management-template.html",
    controllerAs: 'managementCtrl',
    controller:
      ['$http', 'Container','Workspace',
        function ManagementAreaController($http,Container,Workspace)
        {
          console.log("asdad");

          var self = this;
          var injector = angular.injector(['ng', 'app.managementArea','services']);

          self.containers = Container.getAllContainers();

          /*
           Executes one of the actions for a given container
           */
          self.executeContainerAction = function(action,containerName)
          {
            Container.executeContainerAction(action,containerName);
            self.containers = Container.getAllContainers();
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
                Workspace.delete
                ({
                  containerName: containerName,
                  workspaceName: workspaceName,
                  action: 'delete'
                },
                {});
                break;
            }
            self.getAllContainers();
          };

          /*
           Action that receives the id of the table containing the workspaces, and toggles the class hidden
           */
          self.hideWorkspaces = function(id)
          {
            var button = angular.element( document.querySelector( '#'+id ) );
            button.toggleClass("hidden");
          };

          self.workspacesEmpty = function(id)
          {
            /*
              Workaround for the moment. This method was being executed several times, without the loading
              of data. So....
            */
            if(self.containers[id].Workspaces == undefined)
              return true;

            return self.containers[id].Workspaces.length == 0;
          };

        }
      ]
    });

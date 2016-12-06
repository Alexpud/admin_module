'use strict';
angular
  .module('app.userManagementArea')
  .component('userManagementArea',
  {
    templateUrl: "/js/angular/management/user/user.management-template.html",
    controllerAs: 'userManagementCtrl',
    controller:
      ['$http','Workspace',
        function userManagementAreaController($http,Workspace)
        {
          var self = this;
          //var injector = angular.injector(['ng', 'app.managementArea','services']);

          var user = JSON.parse(localStorage.getItem('user'));

          self.workspaces = Workspace.getWorkspace(user.name);
          console.log(self.workspaces);
          /*
           Executes a action for one of the given workspaces
           */
          self.executeWorkspaceAction = function (action,workspaceName,containerName)
          {
            Workspace.executeWorkspaceAction(action,workspaceName,containerName);
          };
        }
      ]
    });

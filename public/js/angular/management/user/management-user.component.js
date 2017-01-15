'use strict';
angular
  .module('app.userManagementArea')
  .component('userManagementArea',
  {
    templateUrl: "/js/angular/management/user/management-user.template.html",
    controllerAs: 'userManagementCtrl',
    controller:
      ['Workspace','$q',
        function userManagementAreaController(Workspace,$q)
        {
          var self = this,
            user = JSON.parse(localStorage.getItem('user'));

          self.defer = $q.defer();
          self.operationResult = {status:"",MSG:""};
          self.workspaces = Workspace.getWorkspace(user.name);
          /*
           Executes a action for one of the given workspaces
           */
          self.executeWorkspaceAction = function (action,workspaceName,containerName)
          {
            $q.resolve(Workspace.executeWorkspaceAction(action,workspaceName,containerName)).then(function(response)
            {
              console.log(response);
              var statusArea = angular.element( document.querySelector('#resStatusArea'));
              statusArea.toggleClass("hidden");
              if(response.status == 201 || response.status != 204 || response.status != 200)
              {
                console.log("Successful");
                self.operationResult.status = true;
                self.operationResult.MSG = "Operation was successfull";

              }
              else
              {
                self.operationResult.status = false;
                self.operationResult.MSG = response.data.error;
              }
            });
          };

          self.goCreate = function(){
            window.location.replace('/#/management/creation');
          }
        }
      ]
    });

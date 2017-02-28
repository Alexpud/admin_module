'use strict';
angular
  .module('app.userManagementArea')
  .component('userManagementArea',
  {
    templateUrl: "/js/angular/management/user/management-user.template.html",
    controllerAs: 'userManagementCtrl',
    controller: ['Workspace','Container','$q', function userManagementAreaController(Workspace,Container,$q)
    {
      var self = this,
        user = JSON.parse(localStorage.getItem('user'));

      self.defer = $q.defer(),
        self.operationResult = {status:"",MSG:""},  
        self.workspaces = Workspace.getWorkspace(user.name);
      console.log(self.workspaces);
      /*
        Executes a action for one of the given workspaces
      */
      self.executeWorkspaceAction = (action,workspaceName,containerName) => {
        if( self.workspaces[0].status != "Running"){
          alert("It seems your container was not started. We are starting it now");
          $q.resolve(Container.executeContainerAction("start",user.name))
            .then((response) => {
              if(response.status != 204) {
                alert("An error ocurred while trying to run the container");
              }
            });
        }

        $q.resolve(Workspace.executeWorkspaceAction(action,workspaceName,containerName))
          .then((response) => {
            console.log(response);
            var statusArea = angular.element( document.querySelector('#resStatusArea'));
            statusArea.toggleClass("hidden");
            if(response.status == 201 || response.status != 204 || response.status != 200) {
              console.log("Successful");
              self.operationResult.status = true;
              self.operationResult.MSG = "Operation was successfull";
            }
            else {
              self.operationResult.status = false;
              self.operationResult.MSG = response.data.error;
            }
          });
      };

      self.goCreate = function(){
        window.location.replace('/#/management/creation');
      }
    }]
  });
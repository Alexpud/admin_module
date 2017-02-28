'use strict';
angular
  .module('app.adminManagementArea')
  .component('adminManagementArea',
  {
    templateUrl: "/js/angular/management/admin/management-admin.template.html",
    controllerAs: 'adminManagementCtrl',
    controller:
      ['$http', '$q','Container','Workspace',
        function adminManagementAreaController($http,$q,Container,Workspace)
        {
          console.log("asdad");

          var self = this,
            injector = angular.injector(['ng','services']);

          self.defer = $q.defer(),
            self.operationResult = {status:"",MSG:""},  
            self.containers = Container.getAllContainers();
          
          
          /*
           Executes one of the actions for a given container
           */
          self.executeContainerAction = function(action,containerName)
          {
            $q.resolve(Container.executeContainerAction(action,containerName)).then(function(response)
            {
              self.afterAction(response);
            });
          };

          /*
           Executes a action for one of the given workspaces
           */
          self.executeWorkspaceAction = function (action,workspaceName,containerName)
          {
            $q.resolve(Workspace.executeWorkspaceAction(action,workspaceName,containerName)).then(function(response)
            {
              self.afterAction(response);
            });
          };

          /*
            Commands to be executed after an action is done 
          */
          self.afterAction = function(response){
            let statusArea = angular.element( document.querySelector('#resStatusArea'));
            statusArea.toggleClass("hidden");
            if(response.status == 201 || response.status == 204 || response.status == 200){
              self.operationResult.status = true;
              self.operationResult.MSG = "Operation was successfull";
            }
            else{
              self.operationResult.status = false;
              self.operationResult.MSG = response.data.error;
            }
            self.containers = Container.getAllContainers();
          }

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
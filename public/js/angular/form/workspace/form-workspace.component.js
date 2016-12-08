angular
  .module('app.workspaceForm')
  .component('workspaceForm',
    {
      controllerAs: 'workspaceFormCtrl',
      templateUrl: '/js/angular/form/workspace/form-workspace.template.html',
      controller:
        ['$resource','$q','Workspace','$uibModal',function workspaceFormController($resource,$q,Workspace,$uibModal)
        {
          var self = this;
          self.defer = $q.defer();
          self.createError = false;
          self.createErrorMessage ="";
          self.createWorkspace = function(workspace)
          {
            var user = JSON.parse(localStorage.getItem('user'));
            $q.resolve(Workspace.executeWorkspaceAction("create",workspace.name,user.name)).then(function(response)
            {
              if(response.status != 201)
              {
                self.createError = true;
                self.createErrorMessage = response.data.error;
                var errorArea = angular.element( document.querySelector('#errorArea'));
                errorArea.toggleClass("hidden");
              }
              console.log(response);
            });
          };
        }]
    });

angular
  .module('app.workspaceForm')
  .component('workspaceForm',
    {
      controllerAs: 'workspaceFormCtrl',
      templateUrl: '/js/angular/form/workspace/form.workspace.template.html',
      controller:
        ['$resource','Workspace',function workspaceFormController($resource,Workspace)
        {
          var self = this;

          self.createWorkspace = function(workspace)
          {
            console.log(workspace);
          };
        }]
    });

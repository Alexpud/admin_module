angular
  .module('app.workspaceForm')
  .component('workspaceForm',
    {
    controllerAs: 'workspaceFormCtrl',
    templateUrl: '/js/angular/form/workspace/form.workspace.template.html',
    controller:
      ['$resource',function workspaceFormController($resource)
      {
        console.log("asdasdasda");
        console.log("lol");
      }]
    });

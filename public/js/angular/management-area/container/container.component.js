angular
  .module('containerTable')
  .component('containerTable',
  {
    controllerAs: 'containerTableCtrl',
    controller: ('containerTableCtrl','Container',
      function containerTableController(Container) {
        var self = this;

        self.startWorkspace = function(name)
        {
          Container.start({id: name,action:'start'});
        };

        self.stopWorkspace = function(id)
        {
          Container.stop({id:name,action:'stop'},{});
        };

        self.deleteWorkspace = function(id)
        {
          Container.delete({id:name,action:'delete'},{});
        };
      }),
    templateUrl: "/js/angular/management-area/container/container.template.html"

  });
angular
  .module('managementArea')
  .factory('test', function()
  {
    return {
      print: function() {
        return {"nome":"asdasd"};
      }
    }
  }).component('managementArea',
  {
    templateUrl: "/js/angular/management-area/management-area-template.html",
    controller:('managementCtrl', [ 'test','ContainerService',
      function ManagementAreaController($scope,test,ContainerService)
      {
        var self = this;

        console.log(test.print());
        console.log(ContainerService);
        /*
           Gets a list of containers from backend
          */
        self.getContainers = function(containerService)
        {
          console.log(containerService);
        };

        /*
           Action that receives the id of the table containing the workspaces, and toggles the class hidden
          */
        self.hideWorkspaces = function(id)
        {
          var button = angular.element( document.querySelector( '#'+id ) );
          button.toggleClass("hidden");
        };

          /*
            Executes one of the actions for a given container
           */
        self.executeContainerAction = function(action,name)
        {
          switch(action) {
            case "start":
              console.log("here");
              break;

            case "stop":
              break;

            case "delete":
              break;
          }

          self.getContainers();
        };

          /*
            Executes a action for one of the given workspaces
           */
        self.executeWorkspaceAction = function (action)
        {
          switch(action)
          {
            case "start":
              break;

            case "stop":
              break;

            case "delete":
              break;
          }

          self.getContainers();
        };
        self.getContainers();
      }
    ]),
    controllerAs: 'managementCtrl'
  });
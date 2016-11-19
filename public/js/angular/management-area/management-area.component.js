angular
  .module('managementArea')
    .component('managementArea',
    {
      templateUrl: "/js/angular/management-area/management-area-template.html",
      controller: ('managementCtrl',
      ['$http', '$routeParams',
        function ManagementAreaController($scope)
        {
          var self = this;

          /*
            Gets a list of containers from backend
           */
          self.getContainers = function()
          {
            $scope.get('api/containers').then(function (response)
            {
              self.resulting_array = response.data;
              console.log(response.data);
            });
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
          self.executeContainerAction = function(action)
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
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
          self.getContainers = function()
          {
            $scope.get('api/containers').then(function (response)
            {
              self.resulting_array = response.data;
              console.log(response.data);
            });
          };

          self.hideWorkspaces = function(id)
          {
            var button = angular.element( document.querySelector( '#'+id ) );
            button.toggleClass("hidden");
          };

          self.getContainers();
        }
      ]),
      controllerAs: 'managementCtrl'
    });
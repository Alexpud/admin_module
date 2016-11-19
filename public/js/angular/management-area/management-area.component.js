angular
  .module('managementArea')
    .component('managementArea',
    {
      templateUrl: "/js/angular/management-area/management-area-template.html",
      controller:
      ['$http', '$routeParams',
        function ManagementAreaController($http)
        {
          var self = this;
          self.getContainers = function()
          {
            $http.get('api/containers').then(function (response)
            {
              self.resulting_array = response.data;
              console.log(response.data);
            });
          };
          self.getContainers();
        }
      ]
    });
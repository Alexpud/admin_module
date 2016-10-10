angular.module('containerList').
    component('containerList',
    {
      templateUrl: "/js/angular/container-list/container-list.template.html",
      controller:
        ['$http', '$routeParams',
          function ContainerListController($http)
          {
            var self = this;

            self.getContainers = function() {
              $http.get('list_containers').then(function (response) {
                self.resulting_array = response.data;
                self.resulting_array[0].test = "test";
              });
            };

            self.getContainers();
          }
        ]
    });

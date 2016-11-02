angular.module('loginForm').
    component('loginForm',
    {
      templateUrl: "/js/angular/login-form/login-form.template.html",
      controller:
        ['$http', '$routeParams',
          function LoginFormController($http)
          {
            var self = this;

            self.getContainers = function() {
              $http.get('api/test').then(function (response) {
                self.resulting_array = response.data;
                console.log(self.resulting_array);
              });
            };

            self.getContainers();
          }
        ]
    });

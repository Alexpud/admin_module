angular.module('loginForm').
    component('loginForm',
    {
      templateUrl: "/js/angular/login-form/login-form.template.html",
      controller:
        ['$http', '$routeParams',
          function LoginFormController($http)
          {
            var self = this;
            self.username = "";
            self.password = "";

            self.login = function(){
          //    $http.post('api/authenticate')  
            };
          }
        ]
    });

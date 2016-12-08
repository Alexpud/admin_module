angular
  .module('app.loginForm')
  .component('loginForm',
    {
      templateUrl: "/js/angular/form/login/form-login.template.html",
      controller:
        ['$http', '$routeParams','User','$location',
          function UserFormController($http,$localStorage,User,$location)
          {
            var self = this;

            self.login = function(user)
            {
              var data =
              {
                login: user.userName,
                password: user.password
              };

              var config = [{'params': user.userName}];
              User.signIn(data,config).then(function(response)
              {
                if(response.status == 'success')
                {
                  $location.path('/management');
                }
              });
            };
          }
        ],
        controllerAs: 'loginCtrl'
    });
